## Brief overview
This rule file defines the deployment workflow for the TFG project. It specifies which scripts to run after different types of file changes.

## Deployment workflow
- After any change in SQL model or data files, run `./docker-make.sh`
- After any change in other files (PHP, JS, HTML, assets), run `./deploy_XAMPP.sh`
- Both deployment scripts may require admin privileges
- Focus the terminal on "use" when running deployment scripts