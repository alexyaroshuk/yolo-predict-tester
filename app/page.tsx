"use client";

import React, { useState, useEffect, useCallback } from "react";
import "tailwindcss/tailwind.css";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_, setModel] = useState<File | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>("No model selected");
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const SERVER_URL = process.env.REACT_APP_SERVER_URL;
  const PREDICT_URL = `${SERVER_URL}/predict`;
  const UPLOAD_MODEL_URL = `${SERVER_URL}/upload_model`;
  const CURRENT_MODEL_URL = `${SERVER_URL}/current_model`;
  const DOWNLOAD_MODEL_URL = `${SERVER_URL}/download_model`;



  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target?.files?.[0]) {
      const file = event.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension !== "png" && fileExtension !== "jpg") {
        setError("Only PNG and JPG images are accepted.");
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
        return;
      }

      setLastImageFile(event.target.files[0]);
      setIsLoading(true);
      setError(null);
      setImage(null); // Clear the previous image
      setIsNewModelUploaded(true);

      const readerForDisplay = new FileReader();
      readerForDisplay.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      readerForDisplay.readAsDataURL(event.target.files[0]);

      const readerForUpload = new FileReader();
      readerForUpload.onload = async (e) => {
        try {
          console.log("Sending request to server...");
          const formData = new FormData();
          formData.append(
            "file",
            new Blob([new Uint8Array(e.target?.result as ArrayBuffer)]),
            "image.jpg"
          );

          const response = await fetch(PREDICT_URL, {
            method: "POST",
            body: formData,
            credentials: "include", // Include cookies
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log("Server is processing the response...");
          const data = await response.json();
          const base64String = data.image;
          setImage(`data:image/jpeg;base64,${base64String}`); // Store the new image URL in state
          setModelUsed(data.model_used); // Store the model used in state
          setResults(data.results);
          console.log("Image received from server");
          console.log("Parsed results:", JSON.parse(data.results)); // Log the parsed results
          console.log("Image received from server");
          setIsLoading(false); // Set loading to false after the image is received
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
      };
      readerForUpload.readAsArrayBuffer(event.target.files[0]);
    }
  };

  const handleModelChange = async (
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

  const getCurrentModel = async () => {
  setIsLoadingModel(true);
  const response = await fetch(CURRENT_MODEL_URL, {
    credentials: "include", // Include cookies
  });
  const data = await response.json();
  if (data.model_used) {
    setCurrentModel(data.model_used);
  } else {
    setCurrentModel("No model selected");
  }
  setIsLoadingModel(false);
};

useEffect(() => {
  getCurrentModel();
}, []);

useEffect(() => {
  console.log('SERVER_URL:', process.env.REACT_APP_SERVER_URL);
}, []);

  const downloadModel = () => {
    window.location.href = DOWNLOAD_MODEL_URL;
  };

 
  useEffect(() => {
    console.log("Current model:", currentModel);
  }, [currentModel]);

  // Check server status when the page loads
  useEffect(() => {
    setIsLoadingServerStatus(true);
    fetch(CURRENT_MODEL_URL)
      .then((response) => {
        if (response.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
        setIsLoadingServerStatus(false);
      })
      .catch((error) => {
        setError("Failed to check server status: " + error.message);
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
    return "Offline";
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col my-4">
        <h1 className="text-4xl font-bold my-2">Yolo predict tester</h1>
        <p>Run your image through yolo model</p>
      </div>
      {isLoadingServerStatus === null ? null : (
        <p style={{ color: getServerStatusColor() }}>
          Server: {getServerStatusText()}
        </p>
      )}
      <div className="flex flex-col mt-4">
        <p className="text-xl mt-2">Upload image</p>
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
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-32 h-32 object-cover ml-4"
            />
          )}
        </div>
      </div>

      <hr className="my-4 border-gray-700" />

      <div className="flex flex-col">
        <p className="text-xl mt-2">Upload model</p>
        <div className="flex justify-between items-start mt-2">
          <input
            type="file"
            id="model-input"
            onChange={handleModelChange}
            disabled={isLoading}
            ref={fileInputRef}
          />

          <div className="flex flex-col items-end max-w-1/2">
            <p>Current model: </p>{" "}
            <p className="text-white font-bold">
              {isLoadingModel ? "Loading model..." : currentModel}
            </p>
            <button
              onClick={downloadModel}
              className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded mt-4"
            >
              Download model
            </button>
          </div>
        </div>
      </div>

      <hr className="my-4 border-gray-700" />

      {image && (
        <div className="container mx-auto my-2">
          <p className="text-xl mt-2">Result</p>

          <p className="mb-2">Model used: {modelUsed}</p>
      {image && isNewModelUploaded && (
        <button
          onClick={reUploadImage}
          className="bg-teal-700 hover:bg-teal-900 text-white py-2 px-4 rounded"
        >
          Re-run
        </button>
      )}

          <div className=" mt-2">
            <div style={{ display: "flex" }}>
              <button
                onClick={() => setActiveTab("image")}
                style={{ 
                  fontWeight: activeTab === 'image' ? 'bold' : 'normal',
                  color: activeTab === 'image' ? 'teal' : undefined,
                  flex: 1,
                  padding: '1em',
                  borderTop: '1px solid transparent',
                  borderLeft: '1px solid transparent',
                  borderRight: '1px solid transparent',
                  borderBottom: activeTab === 'image' ? '2px solid' : '1px solid',
                  borderBottomColor: activeTab === 'image' ? 'teal' : 'dimgrey'
                }}
              >
                Image
              </button>
              <button
                onClick={() => setActiveTab("json")}
                style={{ 
                  fontWeight: activeTab === 'json' ? 'bold' : 'normal',
                  color: activeTab === 'json' ? 'teal' : undefined,
                  flex: 1,
                  padding: '1em',
                  borderTop: '1px solid transparent',
                  borderLeft: '1px solid transparent',
                  borderRight: '1px solid transparent',
                  borderBottom: activeTab === 'json' ? '2px solid' : '1px solid',
                  borderBottomColor: activeTab === 'json' ? 'teal' : 'dimgrey'
                }}
              >
                JSON
              </button>
            </div >
            {activeTab === "image" && (
              <div className=" mt-4">
                <img src={image} alt="Processed" className="w-full" />
              </div>
            )}
            {activeTab === "json" && (
              <div
                style={{
                  fontSize: "0.8em",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {results.map((result, index) => (
                  <div className=" mt-4" key={index}>
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
