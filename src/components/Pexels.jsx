import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Pexels.scss';
import Loader from "./Loader";

import apikey from process.env.REACT_APP_API_KEY;

console.log(process.env)


const Pexels = () => {

  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(JSON.parse(localStorage.getItem('currentPage')))

/////////////////////////////////////////////
  //fetch curated data
  const fetchData = async (page) => {
    setIsError(false)
    setIsLoading(true)

    try {
      const results = await axios("https://api.pexels.com/v1/curated?query=" + "&per_page=10" + `&page=${page}`, {
        method: 'GET',
        statusCode: 200,
        headers:{
          "Authorization": {apikey},
        }
      })
      // console.log(results)
      //set data here
      setData(results.data.photos)
    } catch (err) {
      setIsError(true)
      console.log(err)
      setTimeout(()=> setIsError(false), 4000)
    }
    setIsLoading(false)
  }
  /////////////////////////////////////////////
  //fetch searched data
  const fetchSearchData = async (page, storagedSearch) => {
    setIsError(false)
    setIsLoading(true)

    try {
      const results = await axios(`https://api.pexels.com/v1/search?query=${storagedSearch}` + "&per_page=10" + `&page=${page}`, {
        method: 'GET',
        statusCode: 200,
        headers:{
          // "Authorization": "",
        }
      })
        // console.log(results)
        //set data here
      setData(results.data.photos)
    } catch (err) {
      setIsError(true)
      console.log(err)
      setTimeout(()=> setIsError(false), 4000)
    }
    setIsLoading(false)
  }
  //////////////////////////////////////////////////


  //initiate first load on refresh
  //if local storage contains a search, load searched Data, else load curated Data
  useEffect(() => {
    const storagedSearch = JSON.parse(localStorage.getItem('search'))
    const storagedPage = JSON.parse(localStorage.getItem('currentPage'))
    setSearch(storagedSearch)
    if(!storagedSearch){
      localStorage.setItem('currentPage', JSON.stringify(1))
      fetchData(storagedPage)
    } else {
      fetchSearchData(storagedPage, storagedSearch)
    }
  }, []
  )


  //render controller based on current state
  const renderPics = () => {
    if(isLoading){
      return <Loader/>
    }
    console.log(data)
    return data.map(item => {
      return (
        <div className="card" key={item.id} >
          <h4 className="photographer">{item.photographer}</h4>
          <img alt="" className="image"src={item.src.medium}/>
          <a className="photographer-url" href={item.photographer_url}>Photographer Link</a>
        </div>
      )
    })
  }


  //render if error
  const renderError = () => {
    if(isError) {
      return (
        <div>
          cant get pictures rn, please try later.
        </div>
      )
    }
  }


  //handle search state
  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    localStorage.setItem('search', JSON.stringify(event.target.value))
  }
  

  //handle submit
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsError(false)
    setIsLoading(true)
    fetchSearchData(currentPage, search)
  }
  
  //pagination logic
  const goNext = () => {
      if(!search){
        fetchData(currentPage + 1)
        console.log('fetch')
      } else {
        fetchSearchData(currentPage+1, search)
        console.log('search')
      }
      setCurrentPage(currentPage+1)
      console.log("page is currently:", currentPage)
      localStorage.setItem('currentPage', JSON.stringify(currentPage+1))
  }

  const goPrevious = () => {
    if(!search){
      fetchData(currentPage-1)
    } else {
      fetchSearchData(currentPage-1, search)
    }
    setCurrentPage(currentPage-1)
    console.log("page is currently:", currentPage)
    localStorage.setItem('currentPage', JSON.stringify(currentPage-1))
  }

  return (
    <div className="pexels-container">
      {renderError()}
      <form className="search-form">
        <input 
          value={JSON.parse(localStorage.getItem('search'))} 
          type="text" 
          placeholder="search" 
          className="search-bar"
          onChange={handleSearchChange}
        />
        <button className="search-button" type="submit" onClick={handleSubmit}><i className="fa fa-search"></i></button>
      </form>
      <div className="gallery">{renderPics()}</div>
      <div><button className={currentPage <= 1 ? "active" : "previous-page" } onClick={goPrevious}> ← Previous</button></div>
      <div><button className="next-page" onClick={goNext}>Next →</button></div>
    </div>
  );
};

export default Pexels;