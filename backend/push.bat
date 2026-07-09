@echo off
cd /d "d:\Anuj\ai\web page\all-in-one-ai-solution"
git add -A
git commit -m "fix: production deployment - fix SW cache, CORS, trust proxy, Railway config"
git push origin main
echo Done
