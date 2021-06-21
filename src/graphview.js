import React from 'react';
import G6 from '@antv/g6';
import ReactDOM from 'react-dom'
import styles from './graphview.module.css'

export class GraphView extends React.Component {

  constructor(props) {
    super(props)
    this.ref = React.createRef();
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this.ref.current);
    console.log(`Size: ${container.offsetWidth} x ${container.offsetHeight}`);
    this.graph = new G6.Graph({
      container: this.ref.current,
      width: container.offsetWidth,
      height: container.offsetHeight,
      layout: {
        type: 'gForce',
        minMovement: 0.01,
        maxIteration: 5000,
        preventOverlap: true,
        damping: 0.99,
        fitView: true,
        linkDistance: 100
      },
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'], // Allow users to drag canvas, zoom canvas, and drag nodes
      },
      defaultNode: {
        type: 'circle', // 'bubble'
        size: 30,
        labelCfg: {
          position: 'center',
          style: {
            fill: 'blue',
            fontStyle: 'bold',
            fontFamily: 'sans-serif',
            fontSize: 12
          },
        },
      },
    });

    this.graph.data(this.props.data);
    this.graph.render();
  }

  componentDidUpdate() {
    const container = ReactDOM.findDOMNode(this.ref.current);
    this.graph.changeSize(container.offsetWidth, container.offsetHeight);
    this.graph.data(this.props.data);
    this.graph.render();
  }

  render() {
    return <div ref={this.ref} className={styles.graphContainer}> </div>
  }
}
