import React, { useContext, useState, useEffect } from "react"
import Axios from "axios"
import validator from "validator"
import DispatchContext from "../../DispatchContext"

function CreateApplication({ fetchApplication }) {
  const appDispatch = useContext(DispatchContext)
  const [App_Acronym, setApp_Acronym] = useState("")
  const [App_Rnumber, setApp_Rnumber] = useState("")
  // for offcanvas
  const [App_AcronymOC, setApp_AcronymOC] = useState("")
  const [App_RnumberOC, setApp_RnumberOC] = useState("1")
  const [App_Description, setApp_Description] = useState("")
  const [App_startDate, setApp_startDate] = useState(null)
  const [App_endDate, setApp_endDate] = useState(null)
  const [App_permit_Create, setApp_permit_Create] = useState("")
  const [App_permit_Open, setApp_permit_Open] = useState("")
  const [App_permit_toDoList, setApp_permit_toDoList] = useState("")
  const [App_permit_Doing, setApp_permit_Doing] = useState("")
  const [App_permit_Done, setApp_permit_Done] = useState("")
  const [groups, setGroups] = useState([])

  async function fetchGroups() {
    try {
      const response = await Axios.get(`/get/grouplist`)
      if (response.data.result === "BSJ370") {
        appDispatch({ type: "loggedOut" })
        appDispatch({ type: "errorToast", data: "Token expired. You have been logged out." })
        return
      } else if (response.data === false) {
        appDispatch({ type: "errorToast", data: "Please contact an administrator. (fetchGroups() elseif)" })
        return
      }
      setGroups(response.data.result)
    } catch (e) {
      console.log(e)
      appDispatch({ type: "errorToast", data: "Please contact an administrator.(fetchGroups() catch)" })
    }
  }

  async function handleFastCreateApplication() {
    let mandatoryFieldsCheck = !Boolean(App_Acronym === "" || App_Rnumber === "")
    let rNumValidate = validator.isInt(App_Rnumber, { gt: 0, allow_leading_zeroes: false })
    let appNameValidate = validator.isAlpha(App_Acronym)

    let validation = Boolean(mandatoryFieldsCheck && rNumValidate && appNameValidate)

    if (validation) {
      try {
        const [App_Description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done] = ["", "", "", "", "", "", "", ""]
        const response = await Axios.post("/app/create", { App_Acronym, App_Rnumber, App_Description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done })
        if (response.data.result === "true") {
          appDispatch({ type: "successToast", data: "New Application is created." })
          setApp_Acronym("")
          setApp_Rnumber("")
          fetchApplication()
        } else if (response.data.result === "BSJ370") {
          appDispatch({ type: "loggedOut" })
          appDispatch({ type: "errorToast", data: "Token expired. You have been logged out." })
        } else {
          console.log(App_startDate, App_endDate)
          appDispatch({ type: "errorToast", data: "New Application not created. Please check input fields again." })
        }
      } catch (e) {
        console.log(e)
        appDispatch({ type: "errorToast", data: "Please contact an administrator." })
      }
    } else {
      appDispatch({ type: "errorToast", data: "New Application not created. Please check input fields again." })
    }
  }

  async function handleSubmitCreateApplication() {
    let mandatoryFieldsCheck = !Boolean(App_AcronymOC === "" || App_RnumberOC === "")
    let rNumValidate = validator.isInt(App_RnumberOC, { gt: 0, allow_leading_zeroes: false })
    let appNameValidate = validator.isAlpha(App_AcronymOC)
    let appDescriptionValidate
    if (App_Description !== "") {
      appDescriptionValidate = validator.isAscii(App_Description)
    } else {
      appDescriptionValidate = true
    }
    let dateValidate

    if (App_startDate === "" && App_endDate === "") {
      setApp_startDate(null)
      setApp_endDate(null)
      dateValidate = true
    } else {
      dateValidate = Boolean(App_endDate >= App_startDate)
    }

    let validation = Boolean(mandatoryFieldsCheck && rNumValidate && appNameValidate && dateValidate && appDescriptionValidate)

    if (validation) {
      try {
        const response = await Axios.post("/app/create", { App_Acronym: App_AcronymOC, App_Rnumber: App_RnumberOC, App_Description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done })

        if (response.data.result === "true") {
          appDispatch({ type: "successToast", data: "New Application is created." })
          setApp_AcronymOC("")
          setApp_RnumberOC("1")
          setApp_Acronym("")
          setApp_Rnumber("1")
          setApp_Description("")
          setApp_startDate(null)
          setApp_endDate(null)
          setApp_permit_Create("")
          setApp_permit_Open("")
          setApp_permit_toDoList("")
          setApp_permit_Doing("")
          setApp_permit_Done("")
          fetchApplication()
          document.getElementById("createAppplicationForm").reset()
        } else if (response.data.result === "BSJ370") {
          appDispatch({ type: "loggedOut" })
          appDispatch({ type: "errorToast", data: "Token expired. You have been logged out." })
        } else {
          appDispatch({ type: "errorToast", data: "New Application not created. Please check input fields again." })
        }
      } catch (e) {
        console.log(e)
        appDispatch({ type: "errorToast", data: "Please contact an administrator." })
      }
    } else {
      appDispatch({ type: "errorToast", data: "New Application not created. Please check input fields again." })
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return (
    <>
      <div className="d-flex justify-content-center" style={{ height: "10vh" }}>
        <div className="input-group mb-2" style={{ height: "5vh", width: "90vh" }}>
          <input onChange={e => setApp_Acronym(e.target.value)} value={App_Acronym} placeholder="New Application Name" type="text" className="form-control" />
          <input onChange={e => setApp_Rnumber(e.target.value)} placeholder="Application R-Number" type="text" value={App_Rnumber} className="form-control" />
          {!Boolean(!App_Acronym && !App_Rnumber) ? (
            <button className="btn btn-primary" onClick={handleFastCreateApplication}>
              Fast Create
            </button>
          ) : (
            <button id="createAppButton" className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#createAppFormOC">
              Create App
            </button>
          )}
        </div>
      </div>

      {/* add a reset button, justify content of the buttons to the end */}
      {/* offcanvas starts here */}
      <div className="offcanvas offcanvas-start" id="createAppFormOC" style={{ width: "70vh" }}>
        <div className="offcanvas-header pb-1">
          <h3 className="offcanvas-title">New Application</h3>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body pt-0">
          <h5 className="offcanvas-title">Details</h5>
          <form id="createAppplicationForm">
            <div className="d-flex">
              <div className="pe-3">
                <label htmlFor="applicationName" className="form-label mb-0 mt-1">
                  Name
                </label>
                <input onChange={e => setApp_AcronymOC(e.target.value)} value={App_AcronymOC} type="text" className="form-control" id="applicationName" />
              </div>
              <div>
                <label htmlFor="applicationRnumber" className="form-label mb-0 mt-1">
                  R-number
                </label>
                <input onChange={e => setApp_RnumberOC(e.target.value)} value={App_RnumberOC} type="text" className="form-control" id="applicationRnumber" />
              </div>
            </div>
            <div>
              <label htmlFor="applicationDescription" className="form-label mb-0 mt-1">
                Description
              </label>
              <textarea onChange={e => setApp_Description(e.target.value)} value={App_Description} type="text" className="form-control" id="applicationDescription" rows="10" />
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <label htmlFor="applicationStartDate" className="form-label mb-0 mt-1">
                  Start Date
                </label>
                <input onChange={e => setApp_startDate(e.target.value)} type="date" className="form-control" id="applicationStartDate" style={{ width: "30vh" }} />
              </div>
              <div>
                <label htmlFor="applicationEndDate" className="form-label mb-0 mt-1">
                  End Date
                </label>
                <input onChange={e => setApp_endDate(e.target.value)} type="date" className="form-control" id="applicationEndDate" style={{ width: "30vh" }} />
              </div>
            </div>
            <hr className="border" />
            <h5 className="offcanvas-title pt-2">Access Management</h5>
            <div>
              <label htmlFor="Create" className="form-label mb-0 mt-1">
                Create
              </label>
              <select onChange={e => setApp_permit_Create(e.target.value)} className="form-select" id="Create" style={{ width: "30vh" }}>
                <option value=""></option>
                {groups.map(group => {
                  return (
                    <option key={"create" + group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor="Open" className="form-label mb-0 mt-1">
                Open
              </label>
              <select onChange={e => setApp_permit_Open(e.target.value)} className="form-select" id="Open" style={{ width: "30vh" }}>
                <option value=""></option>
                {groups.map(group => {
                  return (
                    <option key={"open" + group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor="To-Do" className="form-label mb-0 mt-1">
                To-Do
              </label>
              <select onChange={e => setApp_permit_toDoList(e.target.value)} className="form-select" id="To-Do" style={{ width: "30vh" }}>
                <option value=""></option>
                {groups.map(group => {
                  return (
                    <option key={"toDo" + group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor="Doing" className="form-label mb-0 mt-1">
                Doing
              </label>
              <select onChange={e => setApp_permit_Doing(e.target.value)} className="form-select" id="Doing" style={{ width: "30vh" }}>
                <option value=""></option>
                {groups.map(group => {
                  return (
                    <option key={"doing" + group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor="Done" className="form-label mb-0 mt-1">
                Done
              </label>
              <select onChange={e => setApp_permit_Done(e.target.value)} className="form-select" id="Done" style={{ width: "30vh" }}>
                <option value=""></option>
                {groups.map(group => {
                  return (
                    <option key={"done" + group.groupName} value={group.groupName}>
                      {group.groupName}
                    </option>
                  )
                })}
              </select>
            </div>
            <button onClick={handleSubmitCreateApplication} type="button" className="btn btn-primary mt-3" data-bs-dismiss="offcanvas">
              Create
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateApplication
