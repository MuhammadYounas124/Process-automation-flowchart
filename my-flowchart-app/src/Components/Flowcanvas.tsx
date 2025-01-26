import 'admin-lte/dist/css/adminlte.min.css';
import PropertyPanel from './Propertypanel';
import { useState } from 'react';
import ReactFlow, {
    Background,
    Connection,
    Controls,
    Edge,
    MiniMap,
    addEdge,
    useEdgesState,
    useNodesState,
    Node,
} from 'react-flow-renderer';

const initialNodes = [
    { id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 0 }, style: { backgroundColor: '#ffffff' } },
    { id: '2', type: 'output', data: { label: 'End' }, position: { x: 250, y: 400 }, style: { backgroundColor: '#ffffff' } },
];

const initialEdges: Edge<any>[] = [];

const FlowCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeId, setNodeId] = useState(3);
    const [selectedNode, setSelectedNode] = useState<Node<any> | null>(null);

    const onConnect = (params: Edge<any> | Connection) => setEdges((eds) => addEdge(params, eds));

    const addNode = () => {
        const newNode = {
            id: `${nodeId}`,
            data: { label: `Node ${nodeId}` },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            style: { backgroundColor: '#ffffff' },
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeId((id) => id + 1);
    };

    const onNodeClick = (_event: React.MouseEvent, node: Node<any>) => {
        setSelectedNode(node);
    };

    return (
        <div style={{ height: '100vh', display: 'flex' }}>
            <div style={{ flex: 1 }}>
                <button
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 1000,
                        padding: '10px 20px',
                        cursor: 'pointer',
                    }}
                    onClick={addNode}
                >
                    Add Node
                </button>
                <ReactFlow
                    nodes={nodes}
                    onNodesChange={onNodesChange}
                    edges={edges}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    fitView
                    style={{ height: '100%', width: '100%' }}
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>
            <div style={{ width: '300px', padding: '10px', borderLeft: '1px solid #ddd' }}>
               <PropertyPanel selectedNode={selectedNode} setNodes={setNodes} />           
                </div>
        </div>
    );
};

export default FlowCanvas;