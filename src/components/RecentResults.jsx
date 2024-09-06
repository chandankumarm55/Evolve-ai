import React, { useState, useEffect, useMemo } from 'react';
import { FaHistory } from 'react-icons/fa';

const RecentResults = (props) => {
    // Use useMemo to ensure recentImages is only initialized once
    const recentImages = useMemo(() => JSON.parse(localStorage.getItem('imagegeneration')) || [], []);
    const [recentImagesStored, setRecentImagesStored] = useState(recentImages);

    const handleClick = (value) => () => {
        props.onSelect(value);
    };

    useEffect(() => {
        if (props.promptQuery && props.imageResult && recentImages.every((local) => local.src !== props.imageResult)) {
            let updatedRecentImages = [...recentImages];
            if (updatedRecentImages.length === 6) {
                updatedRecentImages.shift();
            }
            updatedRecentImages.push({
                src: props.imageResult,
                name: props.promptQuery,
            });
            localStorage.setItem('imagegeneration', JSON.stringify(updatedRecentImages));
            setRecentImagesStored(updatedRecentImages);
        }
    }, [props.promptQuery, props.imageResult, recentImages]);

    return (
        <div>
            { recentImagesStored.length > 0 && (
                <>
                    <div className="recentImage mt-3 d-flex align-items-center justify-content-center mb-3">
                        <FaHistory style={ { marginRight: '4px' } } />
                        <p className='m-0'>Recent Images</p>
                    </div>
                    <div className={ `recentImageBox row row-cols-3 row-cols-lg-6  ${recentImagesStored.length === 1 ? 'justify-content-center' : 'justify-content-start'}` }>
                        { recentImagesStored.map((value, index) => (
                            <div key={ index } className="col">
                                <div onClick={ handleClick(value.name) }>
                                    <img className='recentimage img-fluid'
                                        src={ value.src }
                                        alt={ value.name }
                                    />
                                    <div className='imagelabel'>{ value.name.slice(0, 18) }..</div>
                                </div>
                            </div>
                        )) }
                    </div>
                </>
            ) }
        </div>
    );
};

export default RecentResults;
