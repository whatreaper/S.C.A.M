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

const maxOffset = 1300; // Set the maximum offset value

async function getExercises() {
    for (let i = 0; i <= maxOffset / 100; i++) { // Set the loop to run until maxOffset
        await fetch(`/addExercises`).then(response => {
            if (response.status >= 400) {
                response.json().then(errorBody => {
                    let message = document.getElementById("message");
                    message.textContent = errorBody.error;
                });
            } else {
                console.log(`Offset (i * 100): ${i * 100}`); // Log the actual offset value
                response.json().then(async body => {
                    let data = body.data;
                    let listOfExercise = data.exercises;
                    for (let j = 0; j < listOfExercise.length; j++) {
                        let exercise = listOfExercise[j];
                        let exerciseId = exercise.exerciseId;
                        let exerciseName = exercise.name;
                        let exercise_gif_url = exercise.gifUrl;
                        let exerciseInstructions = exercise.instructions;
                        let exercise_muscle = exercise.targetMuscles[0];
                        let exercise_body_part = exercise.bodyParts[0];
                        let exercise_equipments = exercise.equipments[0];
                        let exercise_secondary_muscles = exercise.secondaryMuscles;

                        await fetch("/add", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                exerciseId: exerciseId, 
                                exerciseName: exerciseName, 
                                exercise_gif_url: exercise_gif_url, 
                                exerciseInstructions: exerciseInstructions, 
                                exercise_muscle: exercise_muscle, 
                                exercise_body_part: exercise_body_part,
                                exercise_equipments: exercise_equipments,
                                exercise_secondary_muscles: exercise_secondary_muscles
                            }),
                        });
                    }
                }).catch(error => {
                    console.log(error); 
                });
            }
        }).catch(error => {
            console.log("Outer Error:", error);
        });
    }
}

async function getNextPage(url) {
    await fetch(url).then(response => {
        if (response.status >= 400) {
            response.json().then(errorBody => {
                let message = document.getElementById("message");
                message.textContent = errorBody.error;
            });
        } else {
            response.json().then(async body => {
                let data = body.data;
                let currentPage = data.currentPage;
                let totalPages = data.totalPages;

                if(currentPage === totalPages) {
                    url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;
                    fetchExercise(url);
                } else {
                    offset += amount;
                    url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;
                    fetchExercise(url);
                }
  
            }).catch(error => {
                console.log(error); 
            });
        }
    }).catch(error => {
        console.log("Outer Error:", error);
    });
    
}

let exerciseInput = document.getElementById("searchForExercise");
// let displayAmount = document.getElementById("displayAmount");
let sendButton = document.getElementById("send");
let previousButton = document.getElementById("previous");
let nextButton = document.getElementById("next");
let exercise = '';
let amount = 10;
let offset = 0;

document.addEventListener('DOMContentLoaded', () => {
    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;
    fetchExercise(url);
    // Using Fly for database, no need to manually update anymore
    // getExercises();
});

sendButton.addEventListener("click", () => {

    exercise = exerciseInput.value;
    offset = 0;
    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;

    fetchExercise(url);
});

nextButton.addEventListener("click", () => {
    exercise = exerciseInput.value;

    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;

    getNextPage(url);
    
});

previousButton.addEventListener("click", () => {
    exercise = exerciseInput.value;
    /* amount = displayAmount.value;

    function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

    if( !isNumber(amount) || typeof amount === 'undefined') {
        amount = 10;
    } else {
        amount = parseInt(amount);
    } */

    if(offset === 0) {
        offset = 0;
    } else {
        offset -= amount;
    }

    let url = `/exercises?search=${exercise}&offset=${offset}&limit=${amount}`;

    fetchExercise(url);
});