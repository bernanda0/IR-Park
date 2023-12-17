import React, { useState } from "react";
import ReactCodeInput from "react-code-input";

interface CarPlateComponentProps {
  initialPlateNumber: string;
  setPlateNumber: React.Dispatch<React.SetStateAction<string>>;
}

interface CarPlateComponentState {
  plateNumber: string;
}

const CarPlateComponent: React.FC<CarPlateComponentProps> = (props) => {
  const { initialPlateNumber, setPlateNumber } = props;


  const [_, setState] = useState<CarPlateComponentState>({
    plateNumber: initialPlateNumber,
  });

  const updatePlateNumber = (newPlateNumber: string) => {
    setState({
      plateNumber: newPlateNumber,
    });
    setPlateNumber(newPlateNumber)
  };

  return (
    <div className="flex items-center relative bg-black pr-8 pl-4 mb-8 rounded-md shadow-md">
      <div className="absolute left-0 top-0 bottom-0 bg-red-500 w-16 rounded-l-md"></div>
      <div className="flex w-16"></div>
      <ReactCodeInput
        name="input"
        type="text"
        fields={8}
        inputMode="katakana"
        onChange={(e) => updatePlateNumber(e)}
        inputStyle= {{
            textTransform: 'capitalize',
            fontFamily: 'monospace',
            marginLeft:  '10px',
            marginTop: '24px',
            marginBottom: '24px',
            MozAppearance: 'textfield',
            width: '52px',
            height: '128px',
            borderRadius: '3px',
            fontSize: '48px',
            backgroundColor: 'black',
            border: '1px solid gray',
            textAlign: 'center'
        }}
      />
    </div>
    
  );
};

export default CarPlateComponent;
