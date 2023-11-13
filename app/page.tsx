"use client";

import React, { useState, useEffect, useCallback } from "react";
import "tailwindcss/tailwind.css";
import Cookies from "js-cookie";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_, setModel] = useState<File | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>("No model selected");
  const [modelDescription, setModelDescription] = useState<string | null>(null);
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);

  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [isLoadingServerStatus, setIsLoadingServerStatus] = useState<
    boolean | null
  >(null);
  const [lastImageFile, setLastImageFile] = useState<File | null>(null);
  const [isNewModelUploaded, setIsNewModelUploaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("image");
  const [isLoadingModelData, setIsLoadingModelData] = useState(false);

  const [isResultReceived, setIsResultReceived] = useState(false);
  interface DataType {
    type: string;
    image?: string;
    results: any[];
  }

  interface Image {
    filename: string;
    is_video: boolean;
    thumbnail?: string;
  }

  const [sharedImages, setSharedImages] = useState<Image[]>([]);

  const [data, setData] = useState<DataType | null>(null);

  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [userImages, setUserImages] = useState<string[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [projectStructure, setProjectStructure] = useState<any>(null);

  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);
  const [description, setDescription] = useState("");

  const [models, setModels] = useState<string[]>([]);
  const [diskContent, setDiskContent] = useState<string[]>([]);

  const SERVER_URL = process.env.SERVER_URL;
  const GETMODELS_URL = `${SERVER_URL}/models`;
  const PREDICT_URL = `${SERVER_URL}/predict`;
  const UPLOAD_MODEL_URL = `${SERVER_URL}/upload_model`;
  const CURRENT_MODEL_URL = `${SERVER_URL}/current_model`;
  const DOWNLOAD_MODEL_URL = `${SERVER_URL}/download_model`;

  const fetchModels = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/models`, {
        credentials: "include", // Include cookies
      });

      const { models: modelDirs } = await response.json();
      setModels(modelDirs);
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const fetchSharedImages = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/shared_images`, {
        credentials: "include", // Include cookies
      });
      const data = await response.json();
      setSharedImages(data.images);
    } catch (error) {
      console.error("Failed to fetch shared images:", error);
    }
  };

  /* const fetchUserImages = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/user_images`, {
        credentials: "include", // Include cookies
      });
  
      if (!response.ok) {
        console.error("Failed to fetch user images: HTTP error", response.status);
        setUserImages([]); // Set userImages to an empty array in case of error
        return;
      }
  
      const data = await response.json();
      setUserImages(data.images || []); // Ensure that data.images is an array
    } catch (error) {
      console.error("Failed to fetch user images:", error);
      setUserImages([]); // Set userImages to an empty array in case of error
    }
  };
  
  useEffect(() => {
    fetchUserImages();
  }, []); */

  /* const fetchProjectStructure = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/project_structure`, {
        credentials: "include", // Include cookies
      });
      const data = await response.json();
      setProjectStructure(data);
    } catch (error) {
      console.error("Failed to fetch project structure:", error);
    }
  };

  const fetchDiskContent = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/disk_content`, {
        credentials: "include", // Include cookies
      });
      const data = await response.json();
      setDiskContent(data.content);
    } catch (error) {
      console.error("Failed to fetch disk content:", error);
    }
  }; */

  function getVideoThumbnail(file: Blob) {
    return new Promise((resolve, reject) => {
      // Create a video element
      const video = document.createElement("video");

      // When the metadata has been loaded, set the time to the thumbnail frame time
      video.onloadedmetadata = function () {
        video.currentTime = 0;
      };

      // When the video has seeked to the correct time, draw the frame on a canvas
      video.onseeked = function () {
        // Create a canvas and draw the video frame on it
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Could not create 2D context");
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL
        const thumbnail = canvas.toDataURL("image/jpeg");

        // Resolve the promise with the thumbnail
        resolve(thumbnail);
      };

      // Set the video source
      video.src = URL.createObjectURL(file);

      // Catch any errors
      video.onerror = function (err) {
        reject(err);
      };
    });
  }

  const handlePredict = async () => {
    if (!currentImage) {
      setError("No image selected for prediction.");
      return;
    }

    /* console.log("cur image", currentImage); */

    setIsLoading(true);
    setData(null);
    setError(null);
    setImage(null); // Clear the image state variable
    setIsResultReceived(false);

   /*  console.log("trying"); */

    try {
      // Convert the current image data URL to a Blob
      const blobResponse = await fetch(currentImage);
     /*  console.log("13"); */

      const blob = await blobResponse.blob();
    /*   console.log("12"); */

      const formData = new FormData();
   /*    console.log("11"); */
      /* const filename = currentImage.split('/').pop(); */

      // Check if image is not null before appending it to formData
      /* if (image) {
        // Convert the data URL to a Blob
        const response = await fetch(image);
        const blob = await response.blob();
    
        formData.append('file', blob, 'image.jpg');
      } */
      // Provide a default filename if currentImage is a data URL
      // Determine the file extension based on the blob type
      let extension = "";
      if (blob.type === "image/jpeg") {
        extension = ".jpg";
      } else if (blob.type === "image/png") {
        extension = ".png";
      } else if (blob.type === "video/mp4") {
        extension = ".mp4";
      }
      /* console.log("2"); */
      // Provide a default filename if currentImage is a data URL
      const filename = currentImage.startsWith("data:")
        ? `file${extension}`
        : currentImage.split("/").pop();

      formData.append("file", blob, filename);
 /*      console.log("img is", currentImage); */
      const predictResponse = await fetch(PREDICT_URL, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies
      });
      console.log("3");
      if (!predictResponse.ok) {
        throw new Error(`HTTP error! status: ${predictResponse.status}`);
      }

      const responseData = await predictResponse.json();
   /*    console.log("4"); */
      if (responseData.type === "image") {
        const base64String = responseData.image;
        setImage(`responseData:image/jpeg;base64,${base64String}`); // Store the new image URL in state
        setModelUsed(responseData.model_used); // Store the model used in state
        setResults(responseData.results);
      } else if (responseData.type === "video") {
        // Handle video results
        // responseData.results is now an array of objects, each with a 'frame', 'results', and 'annotated_image' property
        setResults(responseData.results);
        setModelUsed(responseData.model_used); // Store the model used in state
      }
      setData(responseData); // Set data to the response data
      setIsResultReceived(true);
      /* console.log("5"); */
    } catch (error) {
      console.error();
      let errorMessage = "An error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
   
    


    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target?.files?.[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      /*  if (fileExtension !== "png" && fileExtension !== "jpg") {
        setError("Only PNG and JPG images are accepted.");
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
        return;
      } */

      if (fileExtension === "mp4") {
        // If the file is a video, create a thumbnail
        const thumbnail = await getVideoThumbnail(file);
        // Now you can use the thumbnail as an image source
        setCurrentImage(thumbnail as string);
      } else {
        setLastImageFile(event.target.files[0]);

        setError(null);
        setImage(null); // Clear the previous image
        setIsNewModelUploaded(true);

        const readerForDisplay = new FileReader();
        readerForDisplay.onload = (e) => {
          // Set the uploaded image as the current image
          setCurrentImage(e.target?.result as string);
          setUploadedImage(e.target?.result as string);
        };
        readerForDisplay.readAsDataURL(event.target.files[0]);
      }
    }
    /* fetchUserImages(); */
  };

  const handleModelChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setIsLoadingModelData(true);
    let selectedModel = event.target.value;

    console.log(selectedModel);

    try {
      const response = await fetch(
        `${SERVER_URL}/select_model?model_name=${encodeURIComponent(
          selectedModel
        )}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.message);
      setCurrentModel(selectedModel);
      await fetchModels();
      console.log(selectedModel);
      fetchModelInfo(selectedModel); // Update currentModel with selectedModel
    } catch (error) {
      console.error("Failed to select model:", error);
    }
    setIsLoadingModelData(false);
  };

  const fetchModelInfo = async (modelName: string) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/model_info/${encodeURIComponent(modelName)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setModelDescription(data.description);
      if (data.photo_url) {
        setModelPhoto(`${SERVER_URL}${data.photo_url}`);
      } else {
        setModelPhoto(null);
      }
    } catch (error) {
      console.error("Failed to fetch model info:", error);
    }
  };
  // Call this function whenever you want to fetch the model info

  /* const handleModelChangeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target?.files?.[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop();

      if (fileExtension !== "pt") {
        setError("This is not a correct YOLO model file.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      setModel(null); // Clear the previous model

      const formData = new FormData();
      formData.append("model_file", file);

      try {
        console.log("Sending model to server...");
        const response = await fetch(UPLOAD_MODEL_URL, {
          method: "POST",
          body: formData,
          credentials: "include", // Include cookies
        });

        console.log("Response:", response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Model updated on server");

        // Get the model name from the response
        const data = await response.json();
        console.log("Response data:", data);
        if (data.model_name) {
          console.log("Model name:", data.model_name);
          setCurrentModel(data.model_name);
          console.log("Current model:", currentModel);

          // Select the uploaded model
          await handleModelChange({
            target: { value: data.model_name },
          } as React.ChangeEvent<HTMLSelectElement>);
        }
      } catch (error) {
        console.error(error);
        let errorMessage = "An error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }; */

  const handleModelUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const modelFileInput = event.currentTarget.elements.namedItem(
      "model_file"
    ) as HTMLInputElement;
    const modelFile = modelFileInput.files?.[0];
    const modelFileExtension = modelFile?.name.split(".").pop()?.toLowerCase();

    if (modelFile && modelFileExtension !== "pt") {
      setError("Only .pt files are accepted for the model.");
      modelFileInput.value = ""; // Clear the file input
      return;
    }

    const photoFileInput = event.currentTarget.elements.namedItem(
      "photo"
    ) as HTMLInputElement;
    const photoFile = photoFileInput.files?.[0];
    const photoFileExtension = photoFile?.name.split(".").pop()?.toLowerCase();

    if (
      photoFile &&
      photoFileExtension !== "jpg" &&
      photoFileExtension !== "png"
    ) {
      setError("Only JPG and PNG images are accepted for the photo.");
      photoFileInput.value = ""; // Clear the file input
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("description", description);

    setIsLoading(true);
    setError(null);
    setModel(null); // Clear the previous model

    try {
      console.log("Sending model to server...");
      const response = await fetch(UPLOAD_MODEL_URL, {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies
      });

      // Get the model name from the response
      const data = await response.json();
      console.log("Response data:", data);
      if (data.model_name) {
        console.log("Model name:", data.model_name);
        setCurrentModel(data.model_name);
        console.log("Current model:", currentModel);

        // Select the uploaded model
        await handleModelChange({
          target: { value: data.model_name },
        } as React.ChangeEvent<HTMLSelectElement>);
      }

      // Fetch the models
      await fetchModels();
    } catch (error) {
      let errorMessage = "An error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsUploadPopupOpen(false); // Close the popup
    }
  };

  const reUploadImage = async () => {
    if (lastImageFile) {
      const event = {
        target: {
          files: [lastImageFile],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleImageUpload(event);
    }
  };

  // This function fetches the current model from the server
  const getCurrentModel = async () => {
    setIsLoadingModel(true);
    const response = await fetch(CURRENT_MODEL_URL, {
      credentials: "include", // Include cookies
    });
    const data = await response.json();
    if (data.model_used) {
      setCurrentModel(data.model_used);
      // Fetch the model info for the current model
      fetchModelInfo(data.model_used);
    } else {
      setCurrentModel("No model selected");
    }
    setIsLoadingModel(false);
  };

  useEffect(() => {
    getCurrentModel();
  }, []);

  const [userId, setUserId] = useState(null);

  /*  useEffect(() => {
    fetchUserImages();
  }, []); */

  const downloadModel = () => {
    window.location.href = DOWNLOAD_MODEL_URL;
  };

  useEffect(() => {}, [currentModel]);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    fetchSharedImages();
  }, []);

  // Check server status when the page loads
  useEffect(() => {
    setIsLoadingServerStatus(true);

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 5000)
    );

    const request = fetch(CURRENT_MODEL_URL)
      .then((response) => {
        if (response.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      })
      .catch((error) => {
        setError("Failed to check server status: " + error.message);
      });

    Promise.race([request, timeout])
      .catch((error) => {
        setError("Failed to check server status: " + error.message);
        setServerStatus("offline");
      })
      .finally(() => {
        setIsLoadingServerStatus(false);
      });
  }, [CURRENT_MODEL_URL]);

  const getServerStatusColor = () => {
    if (isLoadingServerStatus) return "yellow";
    if (serverStatus === "online") return "lightgreen";
    return "red";
  };

  const getServerStatusText = () => {
    if (isLoadingServerStatus) return "Loading server status...";
    if (serverStatus === "online") return "Online";
    return "Offline. Сервер отключается если нет трафика в течение 15 минут. Попробуйте снова через 1 минуту.";
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col my-4">
        <h1 className="text-4xl font-bold my-2">YOLO predict tester</h1>
        <p>Run your image or video through a YOLO model</p>
        <p> </p>
      </div>
      {isLoadingServerStatus === null ? null : (
        <p style={{ color: getServerStatusColor() }}>
          Server: {getServerStatusText()}
        </p>
      )}

      {isUploadPopupOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center ">
          <div className="bg-gray-500 bg-opacity-75 fixed inset-0"></div>

          <div
            className="bg-gray-900 rounded-lg text-left text-white overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg border-2 "
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className=" p-4 sm:p-6">
              <h3 className="text-lg leading-6 font-medium ">
                Upload a new model
              </h3>
              {error && <p className="text-red-500">{error}</p>}
              <form onSubmit={handleModelUpload} className="mt-4">
                <div>
                  <label
                    htmlFor="model-file"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Model file (.pt):
                  </label>
                  <input
                    type="file"
                    id="model-file"
                    name="model_file"
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Photo (optional):
                  </label>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Description (optional):
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border text-black border-gray-300 rounded-md"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUploadPopupOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm font-medium text-white bg-teal-700 hover:bg-teal-900  px-4 py-2 rounded "
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <hr className="my-4 border-gray-700" />

      <div className="flex flex-col">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            <p className="text-xl mt-2">Select a Model</p>
            <select
              id="model-select"
              onChange={async (event) => await handleModelChange(event)}
              disabled={isLoading}
              value={currentModel}
              style={{ width: "80%", color: "black" }}
            >
              {models.map((modelDir: string, index: number) => (
                <option key={index} value={modelDir}>
                  {modelDir}
                </option>
              ))}
            </select>
            <h2>Description</h2>
            <p>
              {isLoadingModelData
                ? "Loading model description..."
                : modelDescription || "No model description"}
            </p>
          </div>
          <div style={{ flex: 1, flexDirection: "column" }}>
            {isLoadingModelData ? (
              <p>Loading model image...</p>
            ) : modelPhoto && modelPhoto.trim() !== "" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={modelPhoto}
                    alt="Model image"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
                <button
                  onClick={downloadModel}
                  className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded mt-4"
                >
                  Download model
                </button>
              </div>
            ) : (
              <p>No model photo</p>
            )}
          </div>
        </div>
        {/* <div className="flex flex-col items-end max-w-1/2">
            <p>Current model: </p>{" "}
            <p className="text-white font-bold">
              {isLoadingModel ? "Loading model..." : currentModel}
            </p>
            <a
              href="https://drive.google.com/drive/folders/1IY27vNFNr5GC9clNgasYnij9ssSd84yV"
              className="text-blue-500 hover:underline mt-2"
            >
              Source
            </a> */}{" "}
        {/* Replace "/your-link-path" and "Your Link Text" with your actual link and text */}
        {/*  <button
              onClick={downloadModel}
              className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded mt-4"
            >
              Download model
            </button> */}
        {/* </div> */}
        {/* </div> */}
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button
        onClick={() => setIsUploadPopupOpen(true)}
        className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded mt-4"
      >
        Upload a new model
      </button>

      {/*     <input
        type="file"
        id="model-input"
        onChange={handleModelChangeUpload}
        disabled={isLoading}
        ref={fileInputRef}
      /> */}

      <hr className="my-4 border-gray-700" />

      <div>
        <p className="text-xl mt-2">Select an image</p>
        <div className="flex flex-row flex-wrap">
          {sharedImages.map((image, index) => (
            <div
              key={index}
              className="relative w-32 h-32 m-2 transition duration-500 ease-in-out transform hover:scale-105 hover:opacity-50"
              onClick={() =>
                setCurrentImage(`${SERVER_URL}/shared_images/${image.filename}`)
              }
            >
              <img
                src={`${SERVER_URL}/${
                  image.is_video ? "shared_thumbnails" : "shared_images"
                }/${image.is_video ? image.thumbnail : image.filename}`}
                alt={image.filename}
                className={`object-cover w-full h-full ${
                  image.is_video ? "filter brightness-50" : ""
                }`}
              />
              {image.is_video && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-12 h-12 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 4v16l15-8-15-8z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
          {/* {userImages.map((image, index) => (
    <img 
      key={index} 
      src={`${SERVER_URL}/user_images/${userId}/${image}`} 
      alt={image} 
      className="w-32 h-32 object-cover m-2 transition duration-500 ease-in-out transform hover:scale-105 hover:opacity-50" 
      onClick={() => setCurrentImage(`${SERVER_URL}/user_images/${userId}/${image}`)}
    />
  ))} */}
        </div>
      </div>

      <div className="flex flex-col mt-4">
        <p className="text-xl mt-2">Or upload a new image</p>
        <div className="flex justify-between items-start mt-2">
          <div>
            <input
              type="file"
              id="image-input"
              onChange={handleImageUpload}
              disabled={isLoading}
              ref={imageInputRef}
            />
          </div>
        </div>
      </div>
      <div>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Current"
            className="w-32 h-32 object-cover ml-4"
          />
        ) : (
          <p>Select or upload an image for prediction</p>
        )}
      </div>
      {currentImage ? (
        <button
          onClick={handlePredict}
          className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded mt-4"
        >
          Predict
        </button>
      ) : null}
      {/*   <div className="flex flex-col mt-4">
        <p className="text-xl mt-2">Check structure</p>

      <button onClick={fetchProjectStructure}>
  Fetch Project Structure
</button>
<pre>{JSON.stringify(projectStructure, null, 2)}</pre>

<button onClick={fetchDiskContent}>
  Fetch Disk Content
</button>
// Display the disk content in a text element
<pre>{JSON.stringify(diskContent, null, 2)}</pre>
</div> */}

      {isResultReceived && (
        <div className="container mx-auto my-2">
          <hr className="my-4 border-gray-700" />
          <p className="text-xl mt-2">Result</p>

          <p className="mb-2">Model used: {modelUsed}</p>
          {isNewModelUploaded && (
            <button
              onClick={reUploadImage}
              className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded"
            >
              Re-run
            </button>
          )}

          <div className="mt-2">
            <div style={{ display: "flex" }}>
              <button
                onClick={() => setActiveTab("image")}
                style={{
                  fontWeight: activeTab === "image" ? "bold" : "normal",
                  color: activeTab === "image" ? "teal" : undefined,
                  flex: 1,
                  padding: "1em",
                  borderTop: "1px solid transparent",
                  borderLeft: "1px solid transparent",
                  borderRight: "1px solid transparent",
                  borderBottom:
                    activeTab === "image" ? "2px solid" : "1px solid",
                  borderBottomColor: activeTab === "image" ? "teal" : "dimgrey",
                }}
              >
                Image
              </button>
              <button
                onClick={() => setActiveTab("json")}
                style={{
                  fontWeight: activeTab === "json" ? "bold" : "normal",
                  color: activeTab === "json" ? "teal" : undefined,
                  flex: 1,
                  padding: "1em",
                  borderTop: "1px solid transparent",
                  borderLeft: "1px solid transparent",
                  borderRight: "1px solid transparent",
                  borderBottom:
                    activeTab === "json" ? "2px solid" : "1px solid",
                  borderBottomColor: activeTab === "json" ? "teal" : "dimgrey",
                }}
              >
                JSON
              </button>
            </div>
            <div className="mt-4">
              {activeTab === "image" && data?.type === "image" && (
                <img
                  src={`data:image/jpeg;base64,${data?.image}`}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
              )}
              {activeTab === "image" && data?.type === "video" && (
                <div className="flex flex-wrap">
                  {results.map((result, index) => (
                    <div key={index} className="w-full md:w-1/2 p-2">
                      <img
                        src={`data:image/jpeg;base64,${result.annotated_image}`}
                        alt={`Frame ${result.frame}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {activeTab === "json" && (
              <div
                style={{
                  fontSize: "0.8em",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {results.map((result, index) => (
                  <div className="mt-4" key={index}>
                    <p>{`Result ${index + 1}`}</p>
                    <pre>{result}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && <p className="mt-4">Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
