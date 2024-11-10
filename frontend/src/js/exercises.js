document.addEventListener('DOMContentLoaded', () => {
    fetch("/exercises").then(response => {
        if (response.status >= 400) {
            response.json().then(errorBody => {
                let div = document.getElementById("message");
                div.textContent = errorBody.error;
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
});