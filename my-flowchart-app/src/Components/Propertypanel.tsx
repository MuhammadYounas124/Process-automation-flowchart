import { Node } from 'react-flow-renderer';
import { useState, useEffect } from 'react';

interface PropertyPanelProps {
    selectedNode: Node<any> | null;
    setNodes: (updater: (nodes: Node<any>[]) => Node<any>[]) => void;
}

const PropertyPanel = ({ selectedNode, setNodes }: PropertyPanelProps) => {
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#ffffff'); // Default color
    const [shape, setShape] = useState('rectangle'); // Default shape

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label);
            setColor(selectedNode.style?.backgroundColor || '#ffffff');
            setShape(selectedNode.style?.borderRadius === '50%' ? 'circle' : 'rectangle');
        }
    }, [selectedNode]);

    if (!selectedNode || selectedNode.data.label === 'Start' || selectedNode.data.label === 'End') {
        return <div style={{ padding: '10px' }}>No editable properties for this node</div>;
    }

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleShapeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setShape(e.target.value);
    };

    const handleSave = () => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === selectedNode.id
                    ? {
                          ...node,
                          data: { ...node.data, label },
                          style: {
                              ...node.style,
                              backgroundColor: color,
                              borderRadius: shape === 'circle' ? '50%' : '0',
                          },
                      }
                    : node
            )
        );
    };

    return (
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h4>Node Properties</h4>
            <label>
                Label:
                <input
                    type="text"
                    value={label}
                    onChange={handleLabelChange}
                    style={{
                        width: '100%',
                        padding: '5px',
                        marginTop: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                    }}
                />
            </label>
            <label style={{ marginTop: '10px' }}>
                Color:
                <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    style={{ marginLeft: '5px' }}
                />
            </label>
            <label style={{ marginTop: '10px', display: 'block' }}>
                Shape:
                <select
                    value={shape}
                    onChange={handleShapeChange}
                    style={{
                        width: '100%',
                        padding: '5px',
                        marginTop: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                    }}
                >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                </select>
            </label>
            <button
                onClick={handleSave}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                }}
            >
                Save
            </button>
        </div>
    );
};

export default PropertyPanel;