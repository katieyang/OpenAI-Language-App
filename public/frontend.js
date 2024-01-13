let diff = "easy";
let wordsOrSentences = "words";
let fromSelect = "English";
let toSelect = "Japanese";
let topic = "travel";

let languageList = [
    "English",
    "French",
    "Mandarin",
    "Japanese"
]

let fromSelected = null;
let fromSelectedBtn = null;
let toSelected = null;
let toSelectedBtn = null;
let pronunciationSelected = null;
let pronunciationSelectedBtn = null;
let correctAnswers = 0;

$(document).ready(function(){

    $("#loader").css("display", "none");

    const selectElement = document.getElementById("fromSelect");
    const selectElement2 = document.getElementById("toSelect");

    //            add function to the selectboxes
    for (let i = 0; i < languageList.length;i++) {
        let option = document.createElement("option");
        option.value = languageList[i];
        option.text = languageList[i];
        selectElement.appendChild(option);  

        let option2 = document.createElement("option");
        option2.value = languageList[i];
        option2.text = languageList[i];
        if (languageList[i] == "Japanese") {
            option2.selected = "selected";
        }
        selectElement2.appendChild(option2);  
    }

    $("#myModal").modal('show');
});

//if it is correct, disable the buttons
// if it's not correct, tell the user (maybe play a sound?), and unselect the current selections -> have the message change
async function checkResults(){
    let data = {fromSelected, toSelected, pronunciationSelected};
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    let response = await fetch('/checkResults', options);
    let json = await response.json();
    //response should contain three arrays!
    let correct = JSON.parse(json.body)['correct'];
    if (correct) {
        // flash green
        for (button of [fromSelectedBtn,toSelectedBtn,pronunciationSelectedBtn]){
            button.classList.remove("btn-primary")
            button.classList.add("btn-success")
            fromSelectedBtn.disabled = true;
            toSelectedBtn.disabled = true;
            pronunciationSelectedBtn.disabled = true;
        }

        timed = setTimeout(() => {
            for (button of [fromSelectedBtn, toSelectedBtn, pronunciationSelectedBtn]) {
                button.classList.remove("btn-success")
                button.classList.add("btn-primary")
            }
        }, 1000);
        correctAnswers += 1
        if(correctAnswers == 5){
            $("#victoryModal").modal('show');
        }
    } else {
        // flash red
        for (button of [fromSelectedBtn,toSelectedBtn,pronunciationSelectedBtn]){
            button.classList.remove("btn-primary")
            button.classList.add("btn-danger")
            fromSelectedBtn.classList.remove("active");
            toSelectedBtn.classList.remove("active");
            pronunciationSelectedBtn.classList.remove("active");
        }

        $("#tryagain").text("Please try again!")

        timed = setTimeout(() => {
            for (button of [fromSelectedBtn, toSelectedBtn, pronunciationSelectedBtn]) {
                button.classList.remove("btn-danger")
                button.classList.add("btn-primary")
            }
        }, 1000);

    }
    timed2 = setTimeout(() => {
        fromSelected = null;
        fromSelectedBtn = null;
        toSelected = null;
        toSelectedBtn = null;
        pronunciationSelected = null;
        pronunciationSelectedBtn = null;
    }, 1000);
}

function difficulty(difficulty) {
    diff = String(difficulty);
}

function resultSelected(btn){
    $("#tryagain").text("")
    event.preventDefault();
    //            console.log(btn.classList.contains("active"))

    if (btn.classList.contains("col1")) {
        if (fromSelected != null) {
            fromSelectedBtn.classList.remove("active");
        }

        if (fromSelected == btn.innerText) {
            fromSelected = null;
            fromSelectedBtn = null;
        } else {
            fromSelected = btn.innerText;
            fromSelectedBtn = btn;
        }
    }
    else if (btn.classList.contains("col2")) {
        if (toSelected != null) {
            toSelectedBtn.classList.remove("active");
        }

        if (toSelected == btn.innerText) {
            toSelected = null;
            toSelectedBtn = null;
        } else {
            toSelected = btn.innerText;
            toSelectedBtn = btn;  
        }
    }            
    else if (btn.classList.contains("col3")) {
        if (pronunciationSelected != null) {
            pronunciationSelectedBtn.classList.remove("active");
        }

        if (pronunciationSelected == btn.innerText) {
            pronunciationSelected = null;
            pronunciationSelectedBtn = null;
        } else {
            pronunciationSelected = btn.innerText;
            pronunciationSelectedBtn = btn;
        }
    }

    //check to see if one of each is selected, if so send to check for victory condition and give a response indicating if it's correct or not!
    if(fromSelected && toSelected && pronunciationSelected){
        checkResults();
    }
}


async function submitForm() {
    $("#loader").css("display", "block");
    // update from and to language
    let fromDropdown = document.getElementById("fromSelect");
    let fromSelectedOption = fromDropdown.options[fromDropdown.selectedIndex].text;
    let toDropdown = document.getElementById("toSelect");
    let toSelectedOption = toDropdown.options[toDropdown.selectedIndex].text;

    let topic = String(document.getElementById("topic").value);
    let data = {diff, wordsOrSentences, topic, fromSelectedOption, toSelectedOption};
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    let response = await fetch('/api', options);
    let json = await response.json();

    $("#loader").css("display", "none");

    //    check if status is failed
    if (json['status'] == "fail"){
        $("#errorModal").modal('show');
        //        location.reload() 
        return
    }

    //response should contain three arrays!
    let body = JSON.parse(json.body);

    for (var i = 0; i < body['fromArr'].length; i++) {
        // Creating a div for each button
        const div1 = document.createElement('div');

        // Creating the button
        const template1 = document.createElement('button');
        template1.classList.add("btn", "btn-primary", "m-1", "col1");
        template1.setAttribute("onclick", "resultSelected(this)")
        template1.setAttribute("data-bs-toggle", "button")
        template1.innerHTML = body['fromArr'][i];

        // Appending the button to the div
        div1.appendChild(template1);

        // Appending the div to the 'from' container
        $('#from').append(div1);

        const div2 = document.createElement('div');
        const template2 = document.createElement('button');
        template2.classList.add("btn", "btn-primary", "m-1", "col2");
        template2.setAttribute("onclick", "resultSelected(this)")
        template2.setAttribute("data-bs-toggle", "button")
        template2.innerHTML = body['toArr'][i];
        div2.appendChild(template2);
        $('#to').append(div2);

        const div3 = document.createElement('div');
        const template3 = document.createElement('button');
        template3.classList.add("btn", "btn-primary", "m-1", "col3");
        template3.setAttribute("onclick", "resultSelected(this)")
        template3.setAttribute("data-bs-toggle", "button")
        template3.innerHTML = body['pronunciationArr'][i];
        div3.appendChild(template3);
        $('#pronunciation').append(div3);
    }
}

function ws(type) {
    wordsOrSentences = String(type);
    console.log('this happened')
    console.log(wordsOrSentences)
}
