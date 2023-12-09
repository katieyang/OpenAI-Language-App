//import statement
const OpenAI = require("openai");
let express = require('express');
require('dotenv').config();

let app = express();

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening at ${port}`));

app.use(express.static('./public'));
app.use(express.json({ limit: "1mb" }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let GPTresponse = null;

// takes in selected dict of from, to, pronunication
// returns True if in GPTresponse, False if not
function checkResult(resDict) {
    for (let item of GPTresponse) {
        if (item['from'] == resDict['fromSelected']){
            if(item['to'] == resDict['toSelected'] && item['pronunciation'] == resDict['pronunciationSelected']){
                return true;
            }
        }
    }
    return false;
}

app.post("/api", (request, response) => {
    let data = request.body; //need to pull out inputs and feed into GPT3.5 to generate response
    console.log(data)

    diff = data['diff']
    wordsOrSentences = data['wordsOrSentences']
    topic = data['topic']
    fromLang = data['fromSelectedOption']
    toLang = data['toSelectedOption']

    input = "I am a " + diff + " speaker in " + toLang + ". Can you help me generate 5 pairs of " + wordsOrSentences + " suitable for my level about " + topic + " and the " + fromLang + " translations? Please return only the JSON object and no other text, in this format: [{from: ..., to: ..., pronunication: ...}, {...}]. If you do not understand what '" + topic + "' means, please return 'I don't understand'."

    async function chat() {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: input}],
            model: "gpt-3.5-turbo"
        });

        res = chatCompletion["choices"][0]["message"]["content"];

        console.log(res)

        try{
            GPTresponse = JSON.parse(res);
        }
        catch {
            response.json({
                status: "fail",
                body: null
            })  
            return
    }


    //        GPTresponse = "abc test test"
    ////    sample GPTresponse formatting
    //        GPTresponse=
    //        [
    //        {
    //            "from": "这家便利店提供各式各样的新鲜食材和生活用品。",
    //            "to": "This convenience store offers a wide variety of fresh groceries and household products.",
    //            "pronunciation": "Zhè jiā biànlì diàn tígōng gèshì gèyàng de xīnxiān shícái hé shēnghuó yòngpǐn."
    //        },
    //        {
    //            "from": "这家便利店位于市中心，为顾客提供购物的极大便利。",
    //            "to": "This convenience store is located in the city center, providing great convenience for customers to shop.",
    //            "pronunciation": "Zhè jiā biànlì diàn wèiyú shì zhōngxīn, wèi gùkè tígōng gòuwù de jídà biànlì."
    //        },
    //        {
    //            "from": "这家便利店每天24小时开放，方便顾客随时购物。",
    //            "to": "This convenience store is open 24 hours a day, making it convenient for customers to shop anytime.",
    //            "pronunciation": "Zhè jiā biànlì diàn měitiān 24 xiǎoshí kāifàng, fāngbiàn gùkè suíshí gòuwù."
    //        }
    //    ]

    let shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    //going to need to randomize contents into 3 arrays!
    fromArr = [];
    toArr = [];
    pronunciationArr = [];

    for (let item of GPTresponse){
        fromArr.push(item['from']);
        toArr.push(item['to']);
        pronunciationArr.push(item['pronunciation']);
    }

    shuffleArray(fromArr)
    shuffleArray(toArr)
    shuffleArray(pronunciationArr)

    response.json({
        status: "success",
        body: JSON.stringify({"fromArr":fromArr,"toArr":toArr,"pronunciationArr": pronunciationArr})
    });

}

    chat();

});

app.post("/checkResults", (request, response) => {
    let data = request.body;
    response.json({
        status: "success",
        body: JSON.stringify({"correct": checkResult(data)})
    })
})