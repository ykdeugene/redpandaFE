import React, { useState, useEffect, useContext } from "react"
import Axios from "axios"
import { Offcanvas } from "bootstrap"
import validator from "validator"
import DispatchContext from "../../DispatchContext"

function CreateTask({ application, fetchTasks, plans, fetchApplication }) {
  const appDispatch = useContext(DispatchContext)
  const [taskNameOC, setTaskNameOC] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskPlan, setTaskPlan] = useState("")
  let appName = application.App_Acronym

  async function handleCreateTaskOC() {
    let mandatoryFieldsCheck = !Boolean(taskNameOC === "")
    let taskNameValidation = validator.isAscii(taskNameOC) // validates ascii only
    let taskNameValidation2 = !Boolean(taskNameOC[0] === " ") // validates that the starting char is not a space
    let taskDescriptionValidation = false

    if (taskDescription !== "") {
      taskDescriptionValidation = validator.isAscii(taskDescription)
    } else {
      taskDescriptionValidation = true
    }
    let validation = Boolean(mandatoryFieldsCheck && taskNameValidation && taskNameValidation2 && taskDescriptionValidation)

    if (validation) {
      console.log({
        Task_name: taskNameOC,
        Task_description: taskDescription,
        Task_plan: taskPlan,
        Task_app_Acronym: appName
      })

      try {
        const response = await Axios.post("/task/create", {
          Task_name: taskNameOC,
          Task_description: taskDescription,
          Task_plan: taskPlan,
          Task_app_Acronym: appName
        })
        if (response.data.result === "true") {
          Offcanvas.getInstance(document.getElementById("createTaskFormOC")).hide()
          appDispatch({ type: "successToast", data: "New Task is created." })
          setTaskNameOC("")
          setTaskDescription("")
          setTaskPlan("")
          fetchTasks()
          fetchApplication()
        } else if (response.data.result === "BSJ370") {
          appDispatch({ type: "loggedOut" })
          appDispatch({ type: "errorToast", data: "Token expired. You have been logged out." })
        } else {
          appDispatch({ type: "errorToast", data: "New Task not created. Please check input fields again." })
        }
      } catch (e) {
        console.log(e)
        appDispatch({ type: "errorToast", data: "Please contact an administrator." })
      }
    } else {
      appDispatch({ type: "errorToast", data: "New Task not created." })
      if (!taskNameValidation || !taskNameValidation2) {
        appDispatch({ type: "errorToast", data: "Please check Task Name again. (ASCII only)" })
      }
      if (!taskDescriptionValidation) {
        appDispatch({ type: "errorToast", data: "Please check Description again. (ASCII only)" })
      }
    }
  }

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() => {
          new Offcanvas("#createTaskFormOC").show()
        }}
      >
        Create Task
      </button>

      <div className="offcanvas offcanvas-start" data-bs-backdrop="static" id="createTaskFormOC" style={{ width: "70vh" }}>
        <div className="offcanvas-header pb-1">
          <h3 className="offcanvas-title">New Task</h3>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body pt-0">
          <h5 className="offcanvas-title">Details</h5>
          <form id="createTaskForm">
            <div>
              <label htmlFor="planName" className="form-label mb-0 mt-1">
                Name
              </label>
              <input onChange={e => setTaskNameOC(e.target.value)} value={taskNameOC} type="text" className="form-control" id="planName" style={{ width: "35vh" }} />
            </div>
            <div>
              <label htmlFor="planName" className="form-label mb-0 mt-1">
                Plan
              </label>
              <select onChange={e => setTaskPlan(e.target.value)} value={taskPlan} className="form-select" id="planDropDownList" style={{ width: "30vh" }}>
                <option value="">No Plans Selected</option>
                {plans.map(plan => {
                  return <option key={plan.Plan_MVP_name}>{plan.Plan_MVP_name}</option>
                })}
              </select>
            </div>
            <div>
              <label htmlFor="taskDescription" className="form-label mb-0 mt-1">
                Description
              </label>
              <textarea onChange={e => setTaskDescription(e.target.value)} value={taskDescription} type="text" className="form-control" id="taskDescription" style={{ height: "20vh" }} />
            </div>
            <button onClick={handleCreateTaskOC} type="button" className="btn btn-primary mt-3">
              Create
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateTask
