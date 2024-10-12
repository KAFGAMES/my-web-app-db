git add .

git commit -m "バグ修正"

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


mv index.html .
git add index.html
git commit -m "Move index.html to root"
git push origin main


ワークツリーの未コミットの変更をすべて破棄：
git restore .
