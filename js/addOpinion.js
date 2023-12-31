
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function addOpinion(event){
    event.preventDefault();

    // Get form data
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const url = document.querySelector("#url").value;
    const keywords = document.querySelector("#keywords").value;
    const pastries = document.querySelector("#pastries-checkbox").checked;
    const message = document.querySelector("textarea[name='message']").value;
    const foodRatingElements = document.querySelectorAll("input[name='foodRating']");

    let foodRatingValue;
    for (const radio of foodRatingElements) {
        if (radio.checked) {
            foodRatingValue = radio.value;
            break;
        }
    }

    // Validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidURL(url) {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
    }

    // Check for required fields to be filled out
    if (name === "" || email === "" || url === "" || message === "" || !foodRatingValue) {
        alert("All required fields must be filled out!");
    } else if (!isValidEmail(email)) {
        alert("Please enter a valid email address!");
    } else if (!isValidURL(url)) {
        alert("Please enter a valid URL!");
    } else {
        const newOpinion = {
            id: generateUUID(),
            name,
            email,
            url,
            keywords,
            pastries,
            message,
            foodRatingValue,
            created: new Date(),
            comments: []
        };
    
        let opinions = [];
    
        if (localStorage.myTreesComments){
            opinions=JSON.parse(localStorage.myTreesComments);
        }

        // Add new data to localStorage
        opinions.push(newOpinion);
        localStorage.myTreesComments = JSON.stringify(opinions);
    
        const opinionsPerPage = 3;
        const totalOpinions = opinions.length;
        const newPageNumber = Math.ceil(totalOpinions / opinionsPerPage);
    
        var sendButton = document.querySelector("#send");

        if (sendButton) {
            activateLink(sendButton, 2);
            window.location.hash = `#opinions/${newPageNumber}/${Math.ceil(totalOpinions / opinionsPerPage)}`;
        }
    }
}
