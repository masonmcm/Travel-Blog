// 1. Import React Library
import * as React from "react";
import ReactDOM from "react-dom";

// 2. Import our Data
import Data from "./script/Data"

let main = () => {
    // TODO:
    ReactDOM.render(
        <Gallery images={Data} />, 
        document.getElementById("galleryContainer"));
};

type Image = {
    src: string,
    thumbSrc: string, 
    widthThumb: number,
    heightThumb: number, 
    width: number, 
    height: number, 
    caption: string
}

type GalleryProps = {
    images: Image[]
}

type GalleryState = {
    selected: Image
}

// TODO add selected state

class Gallery extends React.Component<GalleryProps, GalleryState> {

    constructor(props) {
        super(props);

        // this.state.selected = this.props.images[0];
        this.state = {
            selected : this.props.images[0]
        };
 

    }

    render() {
        let orientation;
        if(this.state.selected.height > this.state.selected.width) {
            orientation = "portrait";
        } else {
            orientation = "landscape";
        }
        
        return <div className="gallery">
            <ul className="gallery__master">{
                this.props.images.map((image) => {
                    return <Thumbnail key={image.src} image={image} 
                    selected = {(image === this.state.selected) ? true : false }
                    onSelect= {(image) => this.selectedHandler(image)}/>
                })
            }</ul>
            <div className="gallery__caption">
                <p>{this.state.selected.caption}</p>
            </div>
            <div className="gallery__detail">
                <div className="gallery__detail-img-wrap">
                    <img className="gallery__detail-img "
                        src={this.state.selected.src}></img>
                </div>
            </div>
        </div>;
    }

    selectedHandler(image: Image): void {
        this.setState({
            selected: image
        });
        
    }
}

type ThumbnailProps = {
    image: Image,
    selected: boolean,
    onSelect?: (image: Image) => void,
}

class Thumbnail extends React.Component<ThumbnailProps> {
    render() {
        let imgClass;
        // if(this.props.image.src.includes("sketch")){
        //     imgClass = "gallery__thumb-img-rotate";
        // } else {
        //     imgClass = "gallery__thumb-img";
        // }

        if(this.props.selected){
            imgClass = "gallery-thumb selected"
        }else {
            imgClass = "gallery-thumb"
        }
        
        return <li className={imgClass}
                onClick={() => this.clickHandler()}>
            <div className="gallery__thumb-img-wrap">
                <img className="gallery__thumb-img"
                src={this.props.image.thumbSrc} />
            </div>
        </li>;
    }

    clickHandler() {
        if(this.props.onSelect !== undefined){
            this.props.onSelect(this.props.image);
        }
    }
}

window.addEventListener("load", main);