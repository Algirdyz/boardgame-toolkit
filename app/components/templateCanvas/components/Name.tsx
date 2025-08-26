import * as fabric from 'fabric';

export const createName = () => {
    const nameText = new fabric.Textbox('Name', {
        left: 300,
        top: 50,
        width: 150,
        fontSize: 20,
        textAlign: 'center',
        backgroundColor: 'white',
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerSize: 6,
        transparentCorners: false
    });
    return nameText;
};
