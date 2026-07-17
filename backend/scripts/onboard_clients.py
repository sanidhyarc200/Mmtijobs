"""
One-off client onboarding for MMTI Jobs.

For each real client company this script:
  1. generates a strong temporary password,
  2. updates the production API's registeredCompanies + users collections so
     the client can log in (and fixes Solar's placeholder email everywhere,
     including their jobs' companyEmail),
  3. optionally emails the client their credentials using the MMTI-branded
     template (requires Brevo SMTP values in backend/.env).

Usage (from backend/):
  .venv/bin/python scripts/onboard_clients.py            # upload + print creds
  .venv/bin/python scripts/onboard_clients.py --send-emails

backend/.env (only needed for --send-emails):
  BREVO_SMTP_LOGIN=...
  BREVO_SMTP_KEY=...
  DEFAULT_FROM_EMAIL=you@example.com
"""

import argparse
import json
import os
import secrets
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
API = os.environ.get("TARGET_API", "https://mmtjobs-api.onrender.com")

OLD_SOLAR_EMAIL = "hr@solarenergy.example"

CLIENTS = [
    {"match_email": "aishwaryabic43@gmail.com", "name": "Bhoomika Investment Service (BIC Infra)"},
    {"match_email": "info@paraslifestyles.com", "name": "Paras Lifestyles Pvt. Ltd"},
    {
        "match_email": OLD_SOLAR_EMAIL.lower(),
        "name": "Solar Energy Company",
        "new_email": "humanresourcesgos@gmail.com",
    },
]

WORDS = [
    "Mango", "Tiger", "River", "Lotus", "Cobra", "Falcon", "Marble", "Sunrise",
    "Copper", "Jasmine", "Peacock", "Bamboo", "Saffron", "Monsoon", "Banyan",
    "Pearl", "Amber", "Cinnamon", "Horizon", "Meadow",
]


def generate_password():
    w1, w2 = secrets.choice(WORDS), secrets.choice(WORDS)
    while w2 == w1:
        w2 = secrets.choice(WORDS)
    return f"{w1}-{w2}-{secrets.randbelow(90) + 10}{secrets.randbelow(90) + 10}"


def http(method, path, payload=None):
    req = urllib.request.Request(
        f"{API}{path}",
        method=method,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload).encode() if payload is not None else None,
    )
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.loads(res.read())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--send-emails", action="store_true")
    args = parser.parse_args()

    print(f"Target API: {API}")
    snapshot = http("GET", "/api/bootstrap/")["collections"]
    companies = snapshot.get("registeredCompanies") or []
    users = snapshot.get("users") or []
    jobs = snapshot.get("jobs") or []

    now = datetime.now(timezone.utc).isoformat()
    results = []

    for client in CLIENTS:
        company = next(
            (c for c in companies if (c.get("email") or "").lower() == client["match_email"]),
            None,
        )
        if company is None:
            print(f"!! Company not found for {client['match_email']} — skipping")
            continue

        password = generate_password()
        new_email = client.get("new_email") or company["email"]
        old_email = company["email"]

        company["email"] = new_email
        company["password"] = password

        # Matching recruiter user: update or create, so company login works
        user = next(
            (
                u
                for u in users
                if u.get("userType") == "recruiter"
                and (u.get("email") or "").lower() in (old_email.lower(), new_email.lower())
            ),
            None,
        )
        if user is None:
            user = {
                "id": int(datetime.now().timestamp() * 1000) + len(results),
                "userType": "recruiter",
                "createdAt": now,
            }
            users.append(user)
        user.update(
            {
                "email": new_email,
                "password": password,
                "name": company.get("name") or client["name"],
                "company": company.get("name") or client["name"],
                "contact": company.get("contact", ""),
            }
        )

        # Fix companyEmail on this client's jobs (Solar's placeholder, mainly)
        fixed_jobs = 0
        for job in jobs:
            if (job.get("companyEmail") or "").lower() == old_email.lower() and old_email != new_email:
                job["companyEmail"] = new_email
                fixed_jobs += 1

        results.append(
            {"name": company.get("name") or client["name"], "email": new_email, "password": password, "fixed_jobs": fixed_jobs}
        )

    if not results:
        sys.exit("Nothing to do.")

    print("\nUploading to API…")
    for key, value in (
        ("registeredCompanies", companies),
        ("users", users),
        ("jobs", jobs),
    ):
        out = http("PUT", f"/api/collections/{key}/", value)
        print(f"  {key}: {out}")

    print("\n=== CLIENT CREDENTIALS (share securely; they must change on first login) ===")
    for r in results:
        note = f" (also fixed {r['fixed_jobs']} job emails)" if r["fixed_jobs"] else ""
        print(f"  {r['name']}\n    email:    {r['email']}\n    password: {r['password']}{note}")

    if args.send_emails:
        # Load backend/.env then boot Django for the branded email sender.
        env_file = BACKEND_DIR / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip())
        sys.path.insert(0, str(BACKEND_DIR))
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mmtjobs_api.settings")
        import django

        django.setup()
        from core.emails import send_credentials_email

        print("\nSending credential emails…")
        for r in results:
            ok = send_credentials_email(r["name"], r["email"], r["password"])
            print(f"  {r['email']}: {'sent' if ok else 'FAILED'}")


if __name__ == "__main__":
    main()
