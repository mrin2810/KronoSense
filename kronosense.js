import { getActiveTabURL, getTotalDuration, getLastFriday, isFriday, isThursday } from "./utils.js";

document.addEventListener("DOMContentLoaded", async function () {
  const activeTab = await getActiveTabURL();
  if (activeTab.url.includes("fastapps.rit.edu/kronosTimecard")) {
    let jobDetails;
    let jobDetailsDict = {};
    let totalDuration = null;
    const employeeDropdown = document.getElementById("employeeDropdown");
    const startDate = document.getElementById("start-date");
    const endDate = document.getElementById("end-date");
    var waitForSelector = setInterval(function () {
      var targetElements = document.querySelectorAll("h3.mat-title");
      if (targetElements) {
        clearInterval(waitForSelector);
        makeAPICalls();
      }
    }, 100);
   
    async function makeAPICalls() {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      try {
        const loader = document.getElementById("loader");
        const main = document.getElementById("main");
        main.classList.add("hide");
        loader.classList.remove("hide");

        const firstResponse = await fetch(
          "https://fastapps.rit.edu/kronosTimecard/rest/users/authenticated",
          requestOptions
        );
        const firstResult = await firstResponse.json();

        const secondResponse = await fetch(
          `https://fastapps.rit.edu/kronosTimecard/rest/employeebyusername/${firstResult["username"]}`,
          requestOptions
        );
        const jobResult = await secondResponse.json();

        // const employeeDetailsDiv = document.getElementById('employeeDetails');
        const employeeHrsDetails =
          document.getElementById("employeeHrsDetails");
        jobDetails = jobResult.list;
        jobDetails.forEach((employee, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.text = `${employee.department_desc}`;
          employeeDropdown.appendChild(option);
        });
        main.classList.remove("hide");
        loader.classList.add("hide");
        // Adding all option in DDM
        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.text = "All";
        employeeDropdown.appendChild(allOption);

        allOption.selected = true;

        displayEmployeeDetails(jobDetails[0]);
        async function employeeChange() {
          let selectedIndex = employeeDropdown.value;
          let all_selected = false;
          if (selectedIndex == "all") {
            all_selected = true;
            selectedIndex = 0;
          }
          const selectedEmployee = jobDetails[selectedIndex];
          console.log(all_selected);
          displayEmployeeDetails(selectedEmployee, all_selected);
        }

        employeeDropdown.addEventListener("change", employeeChange);
        startDate.addEventListener("change", employeeChange);
        endDate.addEventListener("change", employeeChange);

        async function displayEmployeeDetails(employee, all_selected = true) {
          const today = new Date();
          const startDateObj = new Date(today);
          startDateObj.setDate(today.getDate() - 50);

          const startDate = startDateObj.toISOString().split("T")[0];

          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
          const yyyy = today.getFullYear();

          const endDate = `${yyyy}-${mm}-${dd}`;
          let inputStartDate =
            document.getElementById("start-date").value == ""
              ? getLastFriday().toISOString().split("T")[0]
              : document.getElementById("start-date").value;
          let inputEndDate =
            document.getElementById("end-date").value == ""
              ? endDate
              : document.getElementById("end-date").value;
          console.log(inputStartDate);
          console.log(inputEndDate);
          for (let i = 0; i < jobDetails.length; i++) {
            try {
              const additionalResponse = await fetch(
                `https://fastapps.rit.edu/kronosTimecard/rest/timecards/${jobDetails[i].employeeid}/${jobDetails[i].payruleid}/${startDate}/${endDate}`,
                requestOptions
              );
              const additionalResult = await additionalResponse.json();
              if (additionalResponse && additionalResult) {
                loader.classList.add("hide");
                main.classList.remove("hide");
              }
              jobDetailsDict[jobDetails[i].department_desc] = additionalResult;
            } catch (error) {
              console.error(`Error in additional API call ${i + 1}:`, error);
            }
          }

          if (totalDuration == null) {
            employeeHrsDetails.classList.add("hide");
          }
          if (all_selected == true) {
            let result_all = [];
            for (let i = 0; i < jobDetails.length; i++) {
              result_all.push(...jobDetailsDict[jobDetails[i].department_desc]);
            }
            totalDuration = getTotalDuration(
              result_all,
              inputStartDate,
              inputEndDate
            );
          } else {
            totalDuration = getTotalDuration(
              jobDetailsDict[employee.department_desc],
              inputStartDate,
              inputEndDate
            );
          }

          const HrDisplay = document.getElementById("Hrs");
          const hours = Math.floor(totalDuration / 3600);
          const MinDisplay = document.getElementById("Mins");
          const minutes = Math.floor((totalDuration % 3600) / 60);
          if (totalDuration != null) {
            employeeHrsDetails.classList.remove("hide");
            HrDisplay.textContent = hours;
            MinDisplay.textContent = minutes;
          }
          if (allOption.selected) {
            const totalLimit = 20 * 60;
            const remainingHoursDisplay =
              document.getElementById("remainingHrs");
            const remainingMinutesDisplay =
              document.getElementById("remainingMins");
            const worked = (hours * 60 + minutes)
            const remaining = totalLimit - worked;
            const remainingMinutes = remaining % 60;
            const remainingHours = Math.floor(remaining / 60);
            const number = worked / totalLimit;
            const cssPropertyValue = 450 - 450 * number;
            const svg = document.getElementsByClassName("circle");
            // svg.style.setPropery('stroke-dashoffset', `${cssPropertyValue}`);
            remainingHoursDisplay.textContent = remainingHours;
            remainingMinutesDisplay.textContent = remainingMinutes;
            // Hide the remainingDiv since "All" is selected
            const remainingDiv = document.getElementById("remainingHours");
            if (remainingDiv) remainingDiv.style.display = "";
            
          } else {
            // Show the remainingDiv when "All" is not selected
            const remainingDiv = document.getElementById("remainingHours");
            if (remainingDiv) remainingDiv.style.display = "none"; // Use an empty string to revert to default display
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    const dateInput = document.getElementById("start-date");
    dateInput.addEventListener("change", function () {
      const selectedDate = this.value;
      dateInput2.min = dateInput.value;
      dateInput2.disabled = false;
      dateInput2.max = startDateObj.toISOString().split("T")[0];
      dateInput.max = startDateObj.toISOString().split("T")[0];
    });

    const dateInput2 = document.getElementById("end-date");
    dateInput2.disabled = true;
    dateInput2.addEventListener("change", function () {
      const selectedDate = this.value;
    });
  }
});
