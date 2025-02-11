import './App.css'
import getChatCompletion from '../config.js'
function App() {
  async function search(data){
    const dataObject = {
      movie: data.get("movie"),
      mood: data.get("mood"),
      preference: data.get("preference")
    }
    const recommendation = await getChatCompletion(dataObject);
    console.log(recommendation);
  }
  return (
    <>
      <h1>PopChoice</h1>
      <form action={search}>
        <label htmlFor="movie">
          <h2>What’s your favorite movie and why?</h2>
          <input type="text" placeholder="Your favorite movie" name="movie" id="movie" />
        </label>
        <label htmlFor="mood">
          <h2>Are you in the mood for something new or a classic?</h2>
          <input type="text" placeholder="Your choice" name="mood" id="mood" />
        </label>
        <label htmlFor="preference">
          <h2>Do you wanna have fun or do you want something serious?</h2>
          <input type="text" placeholder="Your preference" name="preference" id="preference" />
        </label>
        <button type="submit">Search</button>
      </form>
    </>
  )
}

export default App
