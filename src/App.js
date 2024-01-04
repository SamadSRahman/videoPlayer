import { useRef, useEffect, useState } from "react";
import "video.js/dist/video-js.css";
// import "./style.css";
import { useParams } from "react-router-dom";

const App = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null)
  const [videoPath, setVideoPath] = useState("")
  const [trackPath, setTrackPath] = useState("")
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
    setVideoPath(`https://videojs.onrender.com/${videoData.video_path}`)
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
          track.mode = "hidden";
          // Store it for usage outside of the loop.
          questionTrack = track;
        }
      }
      // questionTrack.onCueChange(()=>console.log("cue"))
      questionTrack.addEventListener("cuechange", () => {
        displayMCQOverlay(questionData[currentQuestion]);
      });
    }
    //
  }, [videoData]);
  const displayMCQOverlay = (data) => {
    if (questionData.length > 0) {
      setQuestion(data.question.text);
      videoPlayer.pause();
      console.log(videoPlayer);
      setIsDisplay(false);
      setAllAnswers([...data.incorrectAnswers, data.correctAnswer]);
      shuffleArray(allAnswers);
    }
  };

  function handleDone() {
    console.log(videoPlayer);
    setIsDisplay(true); 
    setCurrentQuestion(currentQuestion + 1);
    setIsDisplay(true);
    handlePlay();
  }
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
            <source src={videoPath} type="video/mp4" />
            <track
              src={trackPath}
              label="questions"
              kind="metadata"
              default={true}
            />
          </video>
        </div>
      </div>
      <div className="mcqSection" style={!isDisplay ? {} : { display: "none" }}>
        <h3>{question}</h3>
        {allAnswers.map((answer) => (
          <div key={answer}>
            <input type="radio" name="answer" value={answer} />
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
