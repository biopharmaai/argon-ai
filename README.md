## Argon AI - Frontend Coding Challenge

### Deployed Application 
Go [here](https://argon-ai-git-main-chulanders-projects.vercel.app/)

### For local development
```
npm install
npm run dev
```




### Problem Overview
Sarah, an executive at Pharma Co., is in charge of a drug called Luminarex, an immunotherapy which has not yet been approved by the FDA. Sarah’s drug is currently in phase 3 of Clinical Trials, specifically targeting a disease called Non Small Cell Lung Cancer (NSCLC), and Sarah hopes that her drug will be approved soon.
Sarah wants to develop a better understanding of her competitive landscape. Specifically, she wants to know about other pharma companies with clinical trials in the NSCLC space.

She currently uses ClinicalTrials.gov to do her research, but is frustrated by how difficult it is to find the clinical trials she is looking for.

### Task
Your task is to build a working application that can help Sarah do research on her competitive space.
Deliverable:

1. Frontend interface that allows the user to type in a search query, hit enter, and get a list of results. The search endpoint can just do a basic keyword match. It doesn’t have to be an API endpoint (a simple function on the frontend is fine).
2. Presentation of the clinical trial results in table format.
3. The ability to manipulate, slice, and dice the data.
4. Clean use of components, states, hooks, and types.
5. A few sentences about:
   - How would you handle state management between components?
   - If Sarah wanted to filter trials by additional criteria (e.g., trial phase, sponsor), how would you extend the functionality?
   - What techniques would you use to ensure efficient rendering of the table, especially when dealing with large datasets?
   - What compromises did you make in your solution, and why were those compromises necessary?
   - How would you identify opportunities to improve the user experience of this application, and what would you prioritize first?
   We have a very strong preference for using our stack (React, NextJS, Typescript). If you plan on using another stack, please check in with us beforehand. Feel free to load the dataset directly into memory so that you don’t have to set up a DB. You do not need to deploy your code. We value clean code and clean project structure.
   Once completed, email over your code in a .zip format or share your github repo with recruiting@argon-ai.com.
   Bonus points:

NSCLC has many different representations in the dataset. For example, it could be “non small cell lung cancer”, “non small cell lung carcinoma”, “NSCLC”, “carcinoma of the lungs, non small cell”, etc. How do we capture all the relevant clinical trials for searches on any disease?
- How do we allow her to search for NSCLC trials -AND- immunotherapy related drugs? - How would you deploy your software?
- What are the alternatives to loading the dataset into memory, and why would you want to use those alternatives?
- How do we evaluate completeness of results?
  Dataset

1. Go to https://clinicaltrials.gov/search
2. Click on the download icon (in between “None Selected” and “Bookmark”) a.
3. Select either CSV or JSON, whichever your choice
4. Select all data fields
5. Download the top 1,000 trials by scrolling to the bottom and clicking “Download”
