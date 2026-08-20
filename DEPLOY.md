GitHub Pages deployment and Crazy Domains DNS steps

1. Push the repo to GitHub

```bash
git add .
git commit -m "Add site and CNAME for www.divinefirm.com.au"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/divinefirm.git
git branch -M main
git push -u origin main
```

2. Enable GitHub Pages
- In your GitHub repo: Settings → Pages → Source = `main` (root)
- If not already present, `CNAME` file with `www.divinefirm.com.au` is included in the repo root.

3. Configure Crazy Domains DNS
- Create four A records for the root `@` pointing to GitHub Pages IPs:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- Create a CNAME record:
  - Host/Name: `www`
  - Value/Points to: `YOUR_GITHUB_USERNAME.github.io`

4. Wait for propagation and verify
- Use `nslookup` or https://www.whatsmydns.net to check `www.divinefirm.com.au`.
- After GitHub detects the custom domain, enable "Enforce HTTPS" in Pages settings.

5. Final checks
- Open `https://www.divinefirm.com.au` and confirm the site.
- Submit the contact form and confirm delivery to `divinefirm30@gmail.com` (ensure FormSubmit was verified).

Notes
- If your registrar supports ALIAS/ANAME for the root, you can use that instead of the four A records.
- Replace `YOUR_GITHUB_USERNAME` with your GitHub username in the above records.
