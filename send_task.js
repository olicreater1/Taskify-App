console.log('send_task.js loaded');
// Formats the task inputs to a json format and variable and returns it.
function formatTask(urgency, body, to, from) {
    const packet = {
        urgency: urgency,
        body: body,
        to: to,
        from: from,
    }
    return packet;
}
// Uses fetch to post the formed packet to the server.
async function postPacket(packet) {
    const response = await fetch('http://192.168.1.147:5000/receive', {
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
        // Sends the packet and saves the output.
        const response = await postPacket(packet);
        // Logs the server response
        console.log('response', response);
        // Checks if the response is ok or not and provides corresponding string to the page.
        if (response.ok) {
            console.log('Packet recieved successfully');
            document.getElementById('task-result').innerHTML = "<span style='color:black;font-weight:bold;'>✅ Task Sent Sucessfully!</span>";
        } else {
            console.log('Error in sending packet');
            document.getElementById('task-result').innerHTML = "<span style='color:red;font-weight:bold;'>❌ Error in sending task! Error code: " + response.status + "</span>";
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('task-result').innerHTML = "<span style='color:red;font-weight:bold;'>❌ Network error occurred!</span>";
    }
    setTimeout(() => {
        document.getElementById('task-make-form').reset();
        document.getElementById('task-result').innerHTML = "";
    }, 5000);
});