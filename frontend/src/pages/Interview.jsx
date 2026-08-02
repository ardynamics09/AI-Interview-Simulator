import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function Interview() {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        name,
        branch,
        year,
        role,
        interviewType,
        questions
    } = location.state || {};


    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answer, setAnswer] = useState("");

    const [answers, setAnswers] = useState([]);

    const [timeLeft, setTimeLeft] = useState(180);

    const [warningCount, setWarningCount] = useState(0);


    const progress =
        questions && questions.length > 0
            ? ((currentQuestion + 1) / questions.length) * 100
            : 0;



    // TAB SWITCH DETECTION

    useEffect(() => {

        const handleVisibilityChange = () => {

            if (document.hidden) {

                if (warningCount === 0) {

                    alert(
                        "⚠️ LAST WARNING!\n\nDo not switch tabs. Next violation will submit the interview."
                    );

                    setWarningCount(1);

                } else {

                    alert(
                        "Interview auto submitted."
                    );

                    navigate("/result", {
                        state: {
                            answers,
                            name,
                            branch,
                            year,
                            role,
                            interviewType
                        }
                    });

                }
            }
        };


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };


    }, [
        warningCount,
        answers,
        navigate,
        name,
        branch,
        year,
        role,
        interviewType
    ]);




    // RESET TIMER WHEN QUESTION CHANGES

    useEffect(() => {

        setTimeLeft(180);

    }, [currentQuestion]);





    // TIMER + COPY PROTECTION

    useEffect(() => {


        const handleKeyDown = (e) => {

            if (
                (e.ctrlKey || e.metaKey) &&
                ["c","v","x","a"].includes(
                    e.key.toLowerCase()
                )
            ) {

                e.preventDefault();

            }

        };


        const handleContextMenu = (e) => {

            e.preventDefault();

        };


        window.addEventListener(
            "keydown",
            handleKeyDown
        );


        window.addEventListener(
            "contextmenu",
            handleContextMenu
        );



        if (timeLeft === 0) {

            handleSkip();

            return;

        }



        const timer = setTimeout(() => {

            setTimeLeft(
                prev => prev - 1
            );

        },1000);



        return () => {

            clearTimeout(timer);

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            window.removeEventListener(
                "contextmenu",
                handleContextMenu
            );

        };


    }, [timeLeft]);



    const goToNext = (finalAnswer) => {


        const updatedAnswers = [
            ...answers,
            {
                question:
                    questions[currentQuestion],
                answer: finalAnswer
            }
        ];


        setAnswers(updatedAnswers);



        if (
            currentQuestion < questions.length - 1
        ) {


            setCurrentQuestion(
                currentQuestion + 1
            );


            setAnswer("");


        } else {


            navigate("/result", {

                state: {

                    answers: updatedAnswers,

                    name,
                    branch,
                    year,
                    role,
                    interviewType

                }

            });


        }

    };



    const handleSubmit = () => {

        if(answer.trim()===""){

            alert(
                "Please enter answer or skip."
            );

            return;

        }


        goToNext(answer);

    };



    const handleSkip = () => {

        goToNext("SKIPPED");

    };



    const minutes = String(
        Math.floor(timeLeft / 60)
    ).padStart(2,"0");


    const seconds = String(
        timeLeft % 60
    ).padStart(2,"0");


    // NO QUESTIONS FOUND

    if (!questions || questions.length === 0) {

        return (
            <div className="page">

                <div className="card">

                    <h1>
                        No Questions Generated
                    </h1>

                    <p>
                        Gemini could not generate questions.
                    </p>


                    <button
                        className="start-btn"
                        onClick={() => navigate("/")}
                    >
                        Back To Home
                    </button>

                </div>

            </div>
        );

    }



    return (

        <div className="page">

            <div className="card">


                <h1>
                    AI Interview Simulator
                </h1>



                <p style={{opacity:0.7}}>

                    {name} | {branch} | {year}

                </p>



                <p
                    style={{
                        color:"#00e676",
                        fontWeight:"bold"
                    }}
                >

                    {role}

                </p>



                <p
                    style={{
                        color:"#4fc3f7",
                        fontWeight:"bold"
                    }}
                >

                    {interviewType}

                </p>




                <p>

                    Question {currentQuestion + 1} of {questions.length}

                </p>




                <p
                    style={{
                        color:"#ff9800",
                        fontWeight:"bold",
                        fontSize:"18px"
                    }}
                >

                    ⏱ {minutes}:{seconds}

                </p>




                <div className="progress-bar">

                    <div

                        className="progress-fill"

                        style={{
                            width:`${progress}%`
                        }}

                    ></div>

                </div>





                <h2
                    style={{
                        marginTop:"20px"
                    }}
                >

                    {questions[currentQuestion]}

                </h2>





                <textarea

                    placeholder="Type your answer here..."

                    rows="8"

                    value={answer}

                    onChange={(e)=>
                        setAnswer(e.target.value)
                    }

                />





                <div

                    style={{
                        display:"flex",
                        gap:"10px",
                        marginTop:"15px"
                    }}

                >



                    <button

                        className="start-btn"

                        onClick={handleSubmit}

                    >

                        Submit Answer

                    </button>





                    <button

                        onClick={handleSkip}

                        style={{

                            background:"#444",

                            color:"#fff",

                            padding:"10px 15px",

                            borderRadius:"8px",

                            border:"none",

                            cursor:"pointer"

                        }}

                    >

                        Skip

                    </button>



                </div>



            </div>


        </div>

    );

}


export default Interview;
