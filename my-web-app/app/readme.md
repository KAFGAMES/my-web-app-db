git add .

git commit -m "Backup commit before making layout changes"

git push






git remote -v

git remote set-url origin https://github.com/KAFGAMES/my-web-app.git

git push origin main

git status






git rm -r --cached .
git add docs/
git add my-web-app/

git commit -m "Clear cache and add files properly"
git push