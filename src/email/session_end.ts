import * as vscode from 'vscode';
import updateLatest from '../time/Latest';

export default function sessionEnd(context: vscode.ExtensionContext, time_worked: number) {
    // Get the API key from the global state
    const apiKey = context.globalState.get("apiKey");
    console.log("Session end API key:", apiKey); // Log the API key for debugging
    console.log("sending email with time worked:", time_worked); // Log the time worked for debugging
    if (!apiKey) {
        vscode.window.showErrorMessage("API key not found. Please log in first.");
        return;
    }
    // Get the current date of the week to save it in the backend
    const weekdays = [ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const date = new Date();
    const day = weekdays[date.getDay()];

    // Fake fetch to know if the user is connected to the internet

    fetch('https://work-progress-backend.vercel.app/api/getConnected', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if(response.ok){
                fetch('https://work-progress-backend.vercel.app/api/updateWeekTime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey, dayTime: time_worked, day: day })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server responded with ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Session end response:", data);
                    vscode.window.showInformationMessage(`Session ended. You worked for ${time_worked/60} minutes.`);
                })
                .catch(error => {
                    console.error("Error sending session end data to backend:", error);
                    vscode.window.showErrorMessage(`Failed to send session end data: ${error.message}`);
            });
        updateLatest(JSON.stringify(apiKey), Math.round(time_worked/60)); // Update the latest time worked in the backend
        }
        })
        
}


    