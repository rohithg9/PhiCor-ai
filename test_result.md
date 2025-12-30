#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "PhiCor.ai digital physiology platform - Expanded disease database with Renal and Neurological systems"

frontend:
  - task: "Expanded Renal Diseases"
    implemented: true
    working: true
    file: "/app/frontend/src/data/renalDiseases.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Created renalDiseases.js with 21 diseases including: AKI (N17.0-9), CKD Stages 1-5 (N18.1-6), ESRD, Glomerular diseases (N00, N03, N04), Diabetic/Hypertensive nephropathy, UTIs (N10, N30, N39), Nephrolithiasis (N20), ADPKD (Q61.2). All diseases displaying correctly with clinical findings."

  - task: "Expanded Neurological Diseases"
    implemented: true
    working: true
    file: "/app/frontend/src/data/neurologicalDiseases.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Created neurologicalDiseases.js with 15 diseases including: Stroke (I63.9, I61.9, I60.9), Epilepsy (G40.9, G41.0), Headaches (G43.9, G44.2), Movement disorders (G20, G25.5), MS (G35), Alzheimer's (G30.9), Neuropathies (G62.9, G61.0), Meningitis (G00.9, G03.9). Parkinson's Disease verified with full clinical data."

  - task: "Disease Count and Categories"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/DashboardMultiScale.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Disease count now 158 (up from 124). New categories added: Renal (21 diseases), Neurological (15 diseases) under 'Other' tab. Brain organ now highlights for neurological diseases, Kidneys highlight for renal diseases."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 3
  run_ui: true

test_plan:
  current_focus:
    - "Verify renal diseases display correctly with clinical data"
    - "Verify neurological diseases display correctly with clinical data"
    - "Test organ highlighting for brain and kidneys"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Added 36 new diseases (21 renal, 15 neurological). Total disease count now 158. Need testing agent to verify: 1) Renal diseases (CKD stages, AKI, UTIs, Nephrolithiasis) display properly with labs and imaging, 2) Neurological diseases (Stroke, Parkinson's, MS, Epilepsy) display properly with clinical findings, 3) Organ highlighting works for brain and kidneys."
    message: "TESTING COMPLETE: PhiCor.ai landing page comprehensive testing successful. ✅ All 8 sections verified: Hero (headline, CTA buttons working), Why Mathematics (content, stats 124/6/∞), PhiCor Meaning (Phi/Cor cards), How It Works (4 steps), Advantage (AI comparison, trajectory chart, 3 cards), CTA (navigation working), Footer (links functional), Mobile Responsiveness (390px viewport - all sections responsive). ✅ Navigation tested: Dashboard buttons work, footer links functional. ✅ No critical issues found. Landing page fully functional across desktop and mobile."