Portfolio JSON Build Hotfix v3.0.1

Purpose
-------
Fixes the build failure caused by a missing comma after an endDate property before the tools property in src/data/portfolio.json.

Safe behavior
-------------
- Does NOT replace your current portfolio data.
- Creates src/data/portfolio.json.bak before making any change.
- Applies only the missing-comma pattern.
- Validates the full JSON after the change.
- Restores the backup automatically if validation fails.

How to use
----------
1. Extract this ZIP directly into your project root:
   D:\Hamid\myProjects\kazi-hamidur-portfolio

2. Open PowerShell in that project folder.

3. Run:
   powershell -ExecutionPolicy Bypass -File .\apply-json-hotfix.ps1

4. If you see:
   SUCCESS: portfolio.json is valid JSON.

5. Run:
   npm run build

6. If the build succeeds, commit the fixed JSON:
   git add src/data/portfolio.json
   git commit -m "Fix portfolio JSON syntax"
   git push

Expected corrected block
------------------------
"startDate": "2011-03",
"endDate": "2014-09",
"tools": [],
"featured": true
