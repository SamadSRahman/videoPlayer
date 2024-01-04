import { useRef, useEffect, useState } from "react";
import "video.js/dist/video-js.css";
// import "./style.css";
import { useParams } from "react-router-dom";

const App = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null)
  const [videoPath, setVideoPath] = useState("")
  const [trackPath, setTrackPath] = useState("")
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  let videoPlayer;
  const {id} = useParams(); 
  const [allAnswers, setAllAnswers] = useState([]);
  const [isDisplay, setIsDisplay] = useState(true);
  const [question, setQuestion] = useState("");
  const [questionData, setQuestionData] = useState([]);
  let [currentQuestion, setCurrentQuestion] = useState(0);
  console.log(id)
  useEffect(() => {
    //fetching data for questions
    fetch(`https://videojs.onrender.com/api/v1/getVideoById/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.data);
        setVideoData(data.data)
      })
      .catch((error) => {
        console.error("There was a problem fetching the data:", error);
      });
  }, []);
useEffect(()=>{
  if(videoData){
    console.log(`https://videojs.onrender.com/${videoData.video_path}`)
    setVideoPath(videoData.video_path)
    setTrackPath(`https://videojs.onrender.com/${videoData.vtt_path}`)
  }
},[videoData])
  useEffect(() => {
 
 
      if (videoRef.current) {
        console.log(videoData,"player loaded")
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
         if(event.target.activeCues[0].text!==undefined){
          const cue = event.target.activeCues[0].text;
         console.log(cue)
         const cueData = JSON.parse(cue)
         console.log(cueData)
          displayMCQOverlay(cueData);
         }
        });
        
      
      
    }
  }, [videoData]);
  const displayMCQOverlay = (data) => {
    console.log(data)
    
      setQuestion(data.question);
      videoPlayer.pause();
      console.log(videoPlayer);
      setIsDisplay(false);
    const arrayAns = data.answers.map(ele=>ele.answer)
    console.log(arrayAns)
    setAllAnswers(arrayAns)  
     
  };

  function handleDone() {
    console.log(videoPlayer);
    setIsDisplay(true); 
    setCurrentQuestion(currentQuestion + 1);
    setIsDisplay(true);
    handlePlay();
  }

  const handlePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  function handleAnswerSelection(answer) {
    setSelectedAnswer(answer);
  
    if (answer === "Satisfied") {
      // Show specific parts of the video for "Satisfied" answer
      videoRef.current.currentTime = 26; // Start from 00:26
      videoRef.current.addEventListener('timeupdate', function handler() {
        if (videoRef.current.currentTime >= 63) {
          // After 01:04, jump to 01:47
          videoRef.current.currentTime = 107;
          videoRef.current.removeEventListener('timeupdate', handler); // Remove the event listener
        }
      });
    } else if (answer === "Dissatisfied") {
      // Show a different part of the video for "Dissatisfied" answer
      videoRef.current.currentTime = 66; // Start from 01:05
    }
  }
  

  return (
    <div className="App">
      <div style={isDisplay ? {} : { display: "none" }}>
        <div data-vjs-player>
          <video
          // crossOrigin="anonymous"
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            controls
            width="430"
            height="200"
          >
            <source src={`https://videojs-jfzo.onrender.com/video-1704349479931.mp4`} type="video/mp4" />
            <track
              src="/questionnare.vtt"
              label="questions"
              kind="metadata"
              default={true}
            />
          </video>
        </div>
      </div>
      <div className="mcqSection" style={!isDisplay ? 
        {
          width:"430px",
          height:"200",
          border:"1px solid",
          backgroundColor:'skyblue'
        }
         : { display: "none" }}>
        <h3>{question}</h3>
        {allAnswers.map((answer) => (
          <div key={answer}>
            <input type="radio" name="answer" value={answer}
              onChange={() => handleAnswerSelection(answer)}/>
            <label>{answer}</label>
            <br/>
          </div>
        ))}
        <button className="doneBtn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
};

export default App;
// 
