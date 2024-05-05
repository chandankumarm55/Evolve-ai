import React from 'react';
import { FaCloudDownloadAlt } from "react-icons/fa";

const ImageBox = (props) => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            { props.imageResult ? (
                <div className="text-center">
                    <div className="imageBox">
                        <img src={ props.imageResult } alt={ props.imageResult } className="img-fluid" style={ { maxWidth: "400px", width: "100%" } } />
                    </div>
                    <div className="download mt-3">
                        <a download={ props.promptQuery } href={ props.imageResult } className="btn btn-primary">
                            <FaCloudDownloadAlt className="mr-1" />
                            Download
                        </a>
                    </div>
                </div>
            ) : (
                <div></div>
            ) }
        </div>
    )
}

export default ImageBox;
