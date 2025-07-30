# GitHub Actions Setup Guide

## 1. GitHub Secrets Setup

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### For Development Environment:
- `DEV_API_KEY` -  Development API key
- `DEV_BASE_URL` -  Development base URL (e.g., `http://dev-api.example.com`)

### For QA Environment:
- `QA_API_KEY` -  QA API key  
- `QA_BASE_URL` -  QA base URL (e.g., `http://qa-api.example.com`)

### For Production Environment:
- `PROD_API_KEY` -  Production API key
- `PROD_BASE_URL` -  Production base URL (e.g., `http://api.example.com`)

## 2. Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add GitHub Actions workflow and setup"

# Push to GitHub
git push origin main
```

## 3. Verify Setup

1. Go to your GitHub repository
2. Click on "Actions" tab
3. You should see the "Bookstore API Automation" workflow
4. The workflow will run automatically on:
   - Push to main/develop branches
   - Pull requests to main/develop branches
   - Manual trigger with environment selection

## 4. Manual Trigger

You can manually trigger the workflow:
1. Go to Actions tab
2. Click "Bookstore API Automation"
3. Click "Run workflow"
4. Select environment (dev/qa/prod)
5. Click "Run workflow"

## 5. View Results

After workflow runs:
- Test reports are available as artifacts
- Allure reports are generated
- Check the Actions tab for detailed logs 