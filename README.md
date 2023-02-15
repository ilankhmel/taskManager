Task Manager - Fullstack App using Vue and MongoDB. App link on 'Render' - https://task-mgr.onrender.com/#/

task management app, that allows the user to add new tasks, edit, remove, label by Importance, and filter / sort tasks.

The app uses a 'Worker', the worker runs in the background and tries to complete the tasks.

If a task fails 5 time the worker will go to the next, highest priority and least tried task it has in its database.

<img width="561" alt="image" src="https://user-images.githubusercontent.com/114099366/219015714-c252c4e3-99d4-4636-8bb6-7ed252e59b0f.png">
