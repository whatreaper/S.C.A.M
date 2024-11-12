function fetchExercise(url) {

    fetch(url).then(response => {
        if (response.status >= 400) {
            response.json().then(errorBody => {
                let message = document.getElementById("message");
                message.textContent = errorBody.error;
            })
        } else {
            response.json().then(body => {
                /* console.log("Received response body"); 
                console.log(body); 
                console.log("Diving into Data");
                console.log(body.data);
                console.log('Diving into Exercises'); */
                let data = body.data;
                let listOfExercise = data.exercises;
                let tbody = document.getElementById("display");
                let currentPage = data.currentPage;
                let totalPage = data.totalPages;

                
                let pageNumberDiv = document.getElementById("pageNumber");
                let pageNumber = `Current Page Number / Total Page: ${currentPage} / ${totalPage}`;
                pageNumberDiv.textContent = pageNumber;

                // clear tbody everytime
                tbody.textContent = '';
    
                for(let i = 0; i < listOfExercise.length; i++) {
                    // console.log(body.data.exercises[i].name);
    
                    let tr = document.createElement("tr");
    
                    let exercise = listOfExercise[i];
                    let exerciseName = exercise.name;
                    let gifUrl = exercise.gifUrl; 
    
                    let tdImg = document.createElement("td");
                    let exerciseImg = document.createElement("img");
                    let imgUrl = 'https://exercisedb-api.vercel.app/api/v1/images/' + gifUrl.slice(48);
                    exerciseImg.src = imgUrl;
                    exerciseImg.alt = gifUrl;
                    exerciseImg.classList.add('half-scaled-image');
                    tdImg.append(exerciseImg);
    
                    let tdExercise = document.createElement("td");
                    tdExercise.textContent = exerciseName;
    
                    let tdInstructions = document.createElement("td");
                    let exerciseInstructions = '';
    
                    for(let i=0; i < exercise.instructions.length; i++) {
                        exerciseInstructions += exercise.instructions[i];
                    }
                    tdInstructions.textContent = exerciseInstructions;
    
                    tr.append(tdImg);
                    tr.append(tdExercise);
                    tr.append(tdInstructions);
                    tbody.append(tr);
                }
                
            }).catch(error => {
                console.log(error); 
            });
        }
    }).catch(error => {
        console.log("Outer Error:", error);
    })
}

let exerciseInput = document.getElementById("searchForExercise");
let displayAmount = document.getElementById("displayAmount");
let sendButton = document.getElementById("send");
let nextButton = document.getElementById("next");
let exercise = '';
let amount = 10;
let offset = 0;

document.addEventListener('DOMContentLoaded', () => {
    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;
    fetchExercise(url);
});

sendButton.addEventListener("click", () => {

    if (typeof exerciseInput.value !== 'undefined' && typeof exerciseInput.value === 'string') {
        exercise = exerciseInput.value;
    }

    amount = displayAmount.value;

    function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

    if( !isNumber(amount) || typeof amount === 'undefined') {
        amount = 10;
    } else {
        amount = displayAmount.value;
    }

    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;

    fetchExercise(url);
});

nextButton.addEventListener("click", () => {
    
    offset += amount;
    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;

    fetchExercise(url);
});