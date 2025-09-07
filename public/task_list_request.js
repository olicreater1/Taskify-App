function fetchTasks() {
  const IP = '192.168.1.203';
  const PORT = '5000';
  // Clear all drop zones
  ['to-do', 'in-progress', 'done'].forEach(zoneId => {
    const zone = document.getElementById(zoneId);
    if (zone) zone.innerHTML = '';
  });

  fetch(`http://${IP}:${PORT}/tasks`)
    .then(res => res.json())
    .then(tasks => {
      tasks.forEach((task, index) => {
        const postIt = document.createElement('div');
        postIt.className = 'post-it';
        postIt.draggable = true;
        postIt.id = `task-${task.id}`;

        postIt.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', postIt.id);
        });

        const head = document.createElement('h1');
        head.className = 'task-head';
        head.textContent = task.urgency;

        const bodyText = document.createElement('p');
        bodyText.className = 'task-body';
        bodyText.textContent = task.body;

        const toText = document.createElement('h2');
        toText.className = 'to';
        toText.textContent = `To: ${task.to}`;

        const fromText = document.createElement('h2');
        fromText.className = 'from';
        fromText.textContent = `From: ${task.from}`;

        postIt.append(head, bodyText, toText, fromText);

        const targetZone = document.getElementById(task.location || 'to-do');
        if (targetZone) {
          targetZone.appendChild(postIt);
        } else {
          console.warn(`Drop zone "${task.location}" not found`);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
}

document.querySelectorAll('.drop-zone').forEach(zone => {
  
  const IP = '192.168.1.203';
  const PORT = '5000';

  zone.addEventListener('dragover', (e) => {
    e.preventDefault(); // Required to allow dropping
    zone.classList.add('drag-over'); // Optional visual feedback
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');

    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.getElementById(taskId);

    if (!taskElement) {
      console.warn(`Task element with ID ${taskId} not found`);
      return;
    }

    if (zone.id === 'trash') {
    // Send delete request
    try {
      const response = await fetch(`http://${IP}:${PORT}/delete-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId.replace('task-', '') })
      });

      if (response.ok) {
        taskElement.remove(); // Remove from DOM
        console.log(`🗑️ Task ${taskId} deleted`);
      } else {
        console.error('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
    return;
    }
    
    // Move the task visually
    zone.appendChild(taskElement);

    // Send updated location to server
    try {
      const response = await fetch(`http://${IP}:${PORT}/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId.replace('task-', ''),
          location: zone.id
        })
      });

      if (!response.ok) {
        console.error('Failed to update task location on server');
      }
    } catch (err) {
      console.error('Error sending update:', err);
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
});