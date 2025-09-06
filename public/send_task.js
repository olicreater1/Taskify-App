console.log('send_task.js loaded');
// Formats the task inputs to a json format and variable and returns it.
function formatTask(urgency, body, to, from) {
    const packet = {
        urgency: urgency,
        body: body,
        to: to,
        from: from,
        location: 'to-do' //deafult
    }
    return packet;
}
// Uses fetch to post the formed packet to the server.
async function postPacket(packet) {
    const response = await fetch('http://localhost:5000/json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(packet)
    });
    return response;
}
// Listener for the submission button to start logging inputs and processing them, sending the packet and providing feedback to the user.
document.getElementById('task-make-form').addEventListener('submit', async function(e) {
    console.log('Form submitted');
    e.preventDefault();
    // all the variables from the form values
    const urgency = document.getElementById('task-urgency').value;
    const body = document.getElementById('task-body').value;
    const to = document.getElementById('to').value;
    const from = document.getElementById('from').value;
    const packet = formatTask(urgency, body, to, from);
    try {
    const resultDiv = document.getElementById('task-result');
    const response = await postPacket(packet);
    if (response.ok) {
        console.log('Packet received successfully');
        resultDiv.innerHTML = "<div class='response'> <span style='color:black;font-weight:bold;'>✅ Task Sent Successfully!</span> </div>";
        fetchTasks();
        setTimeout(() => {
            document.getElementById('task-make-form').reset();
            resultDiv.innerHTML = "";
        }, 5000);
    } else {
        console.log('Error in sending packet');
        resultDiv.innerHTML = "<div class='response'> <span style='color:#e76767;font-weight:bold;'>❌ Error in sending task! Error code: " + response.status + "</span> </div>";
    }

    // Fade in
    const responseElement = resultDiv.querySelector('.response');
    requestAnimationFrame(() => {
        responseElement.classList.add('visible');
    });

    // Fade out after 4 seconds
    setTimeout(() => {
        responseElement.classList.remove('visible');
    }, 4000);

    // Clear message and reset form after fade-out
    } catch (error) {
    console.error('Fetch error:', error);
    const resultDiv = document.getElementById('task-result');
    resultDiv.innerHTML = "<div class='response'> <span style='color:#e76767;font-weight:bold;'>❌ Network error occurred! Try again later.</span> </div>";

    const responseElement = resultDiv.querySelector('.response');
    requestAnimationFrame(() => {
        responseElement.classList.add('visible');
    });

    setTimeout(() => {
        responseElement.classList.remove('visible');
    }, 4000);
    }
});