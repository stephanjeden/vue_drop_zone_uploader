<template>
  <div id="file-drag-drop">

    <h1 id="header">Vue Drag-and-Drop Uploading Widget</h1>

    <div id="blueBox" class="blueBoxNormalAppearance">
      
      <form id="dropFormID" ref="fileform">
        <span id="userMessage" class="showUserMessage" >{{ userMessage }}</span>
        <img id="dropIcon" class="dropIconHidden" src="../assets/dropicon.png" height="90vh" />       
      </form>

      <div id="dragTarget" ref="dropTargetDiv"> </div>
      
    </div>

    <label id="buttonFileSelectorLabel" for="buttonFileSelector">Or <strong>choose it</strong> here.
      <input id="buttonFileSelector" type="file" ref="buttonFileSelector" v-on:change="buttonFileSelectorFunction()"/>
    </label>
  
    <progress max="100" :value.prop="uploadPercentage" v-show="uploadPercentage > 0 && uploadPercentage < 100"> </progress>

    <div id="displayContactsDiv" class="u-full-width" v-show="userMessage == 'All done. Yum!'" ></div>

  </div>
</template>

<script>

import axios from "axios";
import '../../node_modules/skeleton-css/css/skeleton.css'; 

export default {
  data() {
    return {
      isBrowserDragandDropCapable: false,
      file: null,
      uploadPercentage: 0,
      uploadMessage: "",
      userMessage: "Drop your CSV file here.",
    };
  },

  mounted() {

    this.isBrowserDragandDropCapable = this.determineDragAndDropCapable();

    if (this.isBrowserDragandDropCapable) {
      [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop"
      ].forEach( evt => 

        this.$refs.dropTargetDiv.addEventListener(evt, e => {e.preventDefault(); e.stopPropagation();}
        
      , false));

      window.addEventListener("drop", this.stopDefaultBehaviorOfDragOnWindow);
      window.addEventListener("dragover", this.stopDefaultBehaviorOfDragOnWindow);



      this.$refs.dropTargetDiv.addEventListener("drop", this.handleFileDrop);

      this.dropZoneHoverAnimations();
    }

  },

  methods: { 

    stopDefaultBehaviorOfDragOnWindow(e) {
      e.preventDefault();
    },

    handleFileDrop(dropEvent) {

      if (dropEvent.dataTransfer.files.length > 1) {
        this.userMessage = "Please upload one file at a time.";
        return;
      }

      this.handleFileSelection(dropEvent.dataTransfer.files[0]);
    },

    buttonFileSelectorFunction() {
      this.handleFileSelection(this.$refs.buttonFileSelector.files[0]);
    },

    handleFileSelection(fileFromDropEvent) {
      if (!fileFromDropEvent.name.match(/\.csv$/i)) {
        this.userMessage = "Whoops! I can only eat CSV files!";
        return;
      }
      this.file = fileFromDropEvent;
      this.startUploadingAnimation();
      this.submitFile();
    },

    dropZoneHoverAnimations() {
    
      const dropZoneBGConst = document.getElementById("blueBox");
      const dropZoneForm = document.getElementById("dropFormID");
      const userMessage = document.getElementById("userMessage");
      const dropIconConst = document.getElementById("dropIcon");
      const dragTarget = document.getElementById("dragTarget");

      dragTarget.addEventListener("dragenter", startDragAnimation);
      dragTarget.addEventListener("drop", stopDragAnimation);
      dragTarget.addEventListener("dragleave", stopDragAnimation);

      function startDragAnimation() {
        dropZoneBGConst.classList.add("blueBoxAnimations");
        dropZoneForm.classList.add("formAnimations");
        dropIconConst.classList.add("unhideDropIcon");
        userMessage.classList.add("hideUserMessage");
      }

      function stopDragAnimation() {
        dropZoneBGConst.classList.remove("blueBoxAnimations");
        dropZoneForm.classList.remove("formAnimations");
        dropIconConst.classList.remove("unhideDropIcon");
        userMessage.classList.remove("hideUserMessage");
      }
    },

    startUploadingAnimation() {
      document.getElementById("userMessage").classList.add("munching");
    },

    endUploadingAnimation() {
      document.getElementById("userMessage").classList.remove("munching");
    },

    determineDragAndDropCapable() {
      const div = document.createElement("div");
      return (("draggable" in div || ("ondragstart" in div && "ondrop" in div)) && "FormData" in window && "FileReader" in window);
    },



    displayCsvContents() {
      let localLinesVar = `<h1>Your Contacts:</h1><table class='u-full-width' id='contactsTable'>`;
      const csvFileReader = new FileReader();
      csvFileReader.readAsText(this.file);
      csvFileReader.onload = processData;

      function processData(processedFile) {
        let allTextLines = processedFile.target.result.split(/\r\n|\n/);
        for (const individualLine of allTextLines) {
          let dataInLine = individualLine.split(',');
          if (localLinesVar == "<h1>Your Contacts:</h1><table class='u-full-width' id='contactsTable'>") {
            localLinesVar += "<thead> <tr>";

            for (const aSingleValue of dataInLine) {
              localLinesVar += `<th>${aSingleValue}</th>`;
            }
            localLinesVar += "</tr> </thead><tbody> <tr>";
          } else {
            localLinesVar += "<tr>";
            for (const aSingleValue of dataInLine) {
              localLinesVar += `<td>${aSingleValue}</td>`;
            }
            localLinesVar += "</tr>";
          }
        }
        localLinesVar += "</tr></tbody></table>";
        document.getElementById('displayContactsDiv').innerHTML = `${localLinesVar}`;
      }
    },
    

    submitFile() {

      this.userMessage = "Munching...";

      let formData = new FormData();

      formData.append("file", this.file);
      

      /*
      Make the request to the POST /file-drag-drop URL
      */
      axios.post("https://vuedraganddropper.proxy.beeceptor.com", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: progressEvent => this.uploadPercentage = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
      })
      .then(() => {
        this.displayCsvContents();
        this.userMessage = "All done. Yum!";
        this.endUploadingAnimation();
      })
      .catch(() => {
        this.userMessage = "Uh-oh, that didn't work. Try again?";
        this.endUploadingAnimation();
      });
    }
  }
};
</script>



<style>

#file-drag-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.blueBoxNormalAppearance {
  transition: all 0.3s ease-in;
  background: #0483e5;
  width: 50vw;
  margin: auto;
  margin-top: 30px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 3vh;
  padding-bottom: 3vh;
  border-radius: 10px;
}

.blueBoxAnimations {
  background-color: #0483e591;
  width: 55vw;
  padding-top: 5vh;
  padding-bottom: 5vh;
}

.showUserMessage {
  transition: all 0.3s ease-in;
  display: block;
  opacity: 1;
}

.hideUserMessage,
.dropIconHidden {
  display: block;
  position: absolute;
  opacity: 0;
  transition: all 0.3s ease-in;
}

.munching {
  animation-name: munchGrow;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes munchGrow {
  0% {
    font-size: inherit;
  }
  50% {
    font-size: 1.07em;
  }
  100% {
    font-size: inherit;
  }
}

.unhideDropIcon {
  display: block;
  opacity: 1;
  animation-name: iconBounce;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

@keyframes iconBounce {
  0% {
    margin-top: 0;
  }
  50% {
    margin-top: 2vh;
  }
  100% {
    margin-top: 0;
  }
}

form {
  display: block;
  height: 40vh;
  width: 47vw;
  text-align: center;
  line-height: 400px;
  font-size: 1.6vw;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 10px dotted #9bcb43;
  align-self: center;
  transition: all 0.3s ease-in;
  margin-bottom: 0;
}

.formAnimations {
  border: 15px dotted #9bcb43a1;
  height: 44vh;
  width: 50vw;
}

#dragTarget {
  height: 47vh;
  width: 50vw;
  opacity: 0;
  position: absolute;
}

#buttonFileSelector {
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}

#buttonFileSelectorLabel {
color: #0483e5;
margin-top: 15px;
font-size: 1.6vw;
cursor: pointer;
font-weight: 100;
transition: all .1s ease-in;
}

#buttonFileSelectorLabel:hover {
  color:#0066b4;
}

#buttonFileSelectorLabel:active {
  color:#9bcb43;
}

progress {
  width: 400px;
  margin: auto;
  display: block;
  margin-top: 20px;
  margin-bottom: 20px;
}

.drop-files::after {
  content: " ";
  background-image: url("../assets/dropicon.png");
  height: 15vh;
  display: flex;
  background-size: contain;
  background-repeat: no-repeat;
  position: absolute;
}

#displayContactsDiv h1 {
  font-size: 2.2em;
  margin-top: 33px;
  color: #0483e5;
}

#displayContactsDiv {
  margin: 2vw;
  background: #f4f4f4;
  padding: 0 20px 0 20px;
  color: rgb(124, 124, 124);
}


#contactsTable {
  border-collapse: collapse;
  font-size: 2vmin;
}

#contactsTable thead {
  color: #0483e5;
}

#contactsTable tbody tr:nth-child(even) {
  font-weight: 400;
}

@media screen and (max-width: 900px) {
  #userMessage, #buttonFileSelectorLabel {
    font-size: 2.5vmin;
  }
}
 
</style>