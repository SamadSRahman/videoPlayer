import { useRef, useEffect, useState } from "react";
import "video.js/dist/video-js.css";
import "./App.css";
// import video from "./videos/sampleVideo.mp4";
import gif from "./videos/gif.mp4";
import { useParams } from "react-router-dom";
import axios from "axios";


const App = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [videoPath, setVideoPath] = useState("");
  const [trackPath, setTrackPath] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [skip, setSkip] = useState(false);
  const [multilple, setMultiple] = useState(false);
  const [flag, setFlag] = useState(false);
  const [dataPosted, setDataPosted] = useState(false);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState({});

  let videoPlayer;
  const { id } = useParams();
  const { user } = useParams();
  console.log(user)

  const [allAnswers, setAllAnswers] = useState([
    "answer1",
    "answer2",
    "answer3",
    "answer4",
  ]);
  const [isDisplay, setIsDisplay] = useState(true);
  const [question, setQuestion] = useState("");
  const [questionData, setQuestionData] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  let [currentQuestion, setCurrentQuestion] = useState(0);
  console.log(id);
  useEffect(() => {
    //fetching data for questions
    fetch(`https://videojs-jfzo.onrender.com/api/v1/getVideoById/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.data);
        setVideoData(data.data);
      })
      .catch((error) => {
        console.error("There was a problem fetching the data:", error);
      });
  }, []);
  useEffect(() => {
    if (videoData) {
      console.log(videoData.video_path);
      console.log(`https://videojs-jfzo.onrender.com/${videoData.video_path}`);
      setVideoPath("https://videojs-jfzo.onrender.com/video-1704359286477.mp4");
      setTrackPath(`https://videojs.onrender.com/${videoData.vtt_path}`);
    }
  }, [videoData]);
  useEffect(() => {
    
      if (videoRef.current) {
        console.log(videoData, "player loaded");
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoPlayer = videoRef.current;
        let tracks = videoPlayer.textTracks;
        let questionTrack;

        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];

          if (track.label === "questions") {
            // track.mode = "hidden";
            // Store it for usage outside of the loop.
            questionTrack = track;
          }
        }
        //  questionTrack.onCueChange(()=>console.log("cue"))
        questionTrack.addEventListener("cuechange", (event) => {
          // console.log(event.target.activeCues[0].text)
          if (event.target.activeCues[0].text !== undefined) {
            const cue = event.target.activeCues[0].text;
            console.log(cue);
            const cueData = JSON.parse(cue);
            console.log(cueData);
            videoPlayer.addEventListener("fullscreenchange", () => {
              const isFullscreen = document.fullscreenElement !== null;
              if (isFullscreen) {
                exitFullScreen();
              }
            });
            displayMCQOverlay(cueData);
          }
        });
      }
    
  }, [videoData]);
  const displayMCQOverlay = (data) => {
    console.log(data);
    setQuestion(data.question);
    setSkip(data.skip);
    setMultiple(data.multiple);
    videoPlayer.pause();
    console.log(videoPlayer);
    setIsDisplay(false);
    const arrayAns = data.answers.map((ele) => ele.answer);
    console.log(arrayAns);
    setAllAnswers(arrayAns);
  };
  console.log(selectedAnswers);

  function handleDone() {
    if (!selectedAnswer.length) {
      alert("Please select an answer before submitting.");
      return;
    }
  
    let newSelectedAnswer = [...selectedAnswer];
    if (!flag) {
      if (newSelectedAnswer[0] === "Satisfied") {
        videoRef.current.currentTime = 23.9; // Start from 00:26
        setTimeout(() => handlePlay(), 100)
        videoRef.current.addEventListener("timeupdate", function handler() {
          if (videoRef.current.currentTime >= 52) {
            videoRef.current.currentTime = 89.4;
            videoRef.current.removeEventListener("timeupdate", handler);
          }
          setFlag(true);
      
        });
        videoRef.current.play();
      } else if (newSelectedAnswer[0] === "Dissatisfied") {
        videoRef.current.currentTime = 54; // Start from 01:05
        setFlag(true);
        setTimeout(() => handlePlay(), 100); // Delay handlePlay() by 100 milliseconds
      }
    }
 
    const updatedQuestion = {
      question,
      selectedAns: newSelectedAnswer,
    };
    setSelectedAnswer([]);
    setAnsweredQuestions([...answeredQuestions, updatedQuestion]);
  
    setCurrentQuestion(currentQuestion + 1);
    handlePlay();
    setIsDisplay(true);
  
  }
  
  useEffect(() => {
    console.log(answeredQuestions);
  
    function handleTimeUpdate() {
      if (videoRef.current.currentTime >= 90 && !dataPosted) {
        const postData = async (data) => {
          try {
            const response = await axios.post("https://videojs-jfzo.onrender.com/api/v2/queAnsCreate", data);
            console.log('Data successfully posted:', response.data);
            return response.data; // Return response if needed
          } catch (error) {
            console.error('Error posting data:', error);
            throw new Error(error);
          }
        };
        
        // Example object to post
        const myObject = {
          userId: id,
          data: answeredQuestions,
        };
        postData(myObject);

        setDataPosted(true);
      }
    }
  
    const videoElement = videoRef.current;
  
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
  
    // Cleanup function to remove the event listener
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [answeredQuestions, dataPosted]);
  
  
  const handlePlay = () => {
    console.log(videoRef.current)
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  const handleAnswerSelection = (answer) => {
    let newSelectedAnswer = [...selectedAnswer];
    const answerIndex = newSelectedAnswer.indexOf(answer);

    if (answerIndex !== -1) {
      newSelectedAnswer.splice(answerIndex, 1);
    } else {
      newSelectedAnswer.push(answer);
    }
    setSelectedAnswer(newSelectedAnswer);
    const updatedAnswers = { ...selectedAnswers };
    updatedAnswers[answer] = !updatedAnswers[answer];
    setSelectedAnswers(updatedAnswers);
  };
  const handleSkip = () => {
    setIsDisplay(true);
    handlePlay();
  };
  function isFullScreen() {
    return document.fullscreenElement !== null;
  }

  function exitFullScreen() {
    if (isFullScreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
  useEffect(() => {
    console.log(skip);
  }, [skip]);
  return (
    <div className="App">
      <div style={isDisplay ? {} : { display: "none" }}>
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            controls
            id="videoPlayer"
          >
            <source src="https://videojs-jfzo.onrender.com/video-1704457523928.mp4" type="video/mp4" />
            <track
              src="/questionnare.vtt"
              label="questions"
              kind="metadata"
              default={true}
            />
          </video>
        </div>
      </div>

      <div className="mcqSection" style={!isDisplay ? {} : { display: "none" }}>
        <div className="header">
          <span style={{ minWidth: "20%" }}></span>
          <span className="questionHead">QUESTION</span>
          <video src={gif} alt="gif" autoPlay className="gifPlayer" muted  loop />
        </div>

        <p className="questionText">{question}</p>
        <div className="answerSection">
          {allAnswers.map((answer) => (
            <div key={answer}>
              {multilple === "true" ? (
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAnswer.includes(answer)}
                    onChange={() => handleAnswerSelection(answer)}
                  />
                  {answer}
                </label>
              ) : (
                <label>
                  <input
                    type="radio"
                    checked={selectedAnswer.includes(answer)}
                    onChange={() => handleAnswerSelection(answer)}
                    name="answer"
                  />
                  {answer}
                </label>
              )}
              <br />
            </div>
          ))}
        </div>
        <div className="submitSection">
          <button
            className="skipBtn"
            style={skip === "true" ? {} : { display: "none" }}
            onClick={handleSkip}
          >
            Skip
          </button>
          <button className="doneBtn" onClick={handleDone}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
