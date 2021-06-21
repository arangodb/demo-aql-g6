import React, { useState } from "react";
import SplitPane from "react-split-pane";
import {AqlEditor, JsonEditor} from "./editors"
import {GraphView} from "./graphview"
import {Database} from "arangojs"

import styles from './app.module.css';

const LabelAttr='_key';
const URL="http://localhost:3000";
const DatabaseName="_system";

const InitData = {
  nodes: [
    { id: 'node0' }, { id: 'node1' }, { id: 'node2' },
    { id: 'node3' }, { id: 'node4' }
  ],
  edges: [
    { source: 'node0', target: 'node1' },
    { source: 'node0', target: 'node2' },
    { source: 'node0', target: 'node3' },
    { source: 'node0', target: 'node4' }
  ],
};

const InitQuery = `FOR n1 IN Node 
   LIMIT 1
   FOR n2, e IN 1..2 OUTBOUND n1 Edge
      RETURN e`;

const LoadSampleNodesQuery = `FOR i IN 1..7
   INSERT { _key : TO_STRING(i) } INTO Node`

const LoadSampleEdgesQuery = `LET edges = 
   [ { from : "1", to : "2" }, { from : "1", to: "3" },
     { from : "1", to : "4" }, { from : "2", to: "3" },
     { from : "4", to : "5" }, { from : "4", to: "6" },
     { from : "2", to : "7" }, { from : "3", to: "7" } ]
   FOR e IN edges 
      INSERT { _from : CONCAT("Node/", e.from), _to : CONCAT("Node/", e.to) } INTO Edge`

const App = () => {
  const [heightValue, setHeightValue] = useState("100%");
  const [queryValue, setQueryValue] = useState(InitQuery);
  const [resultValue, setResultValue] = useState("");
  const [graphData, setGraphData] = useState(InitData);
  
  function isValidGraphData(data) {
    if (!Array.isArray(data)) {
      console.log("Expecting array");
      return false;
    }
    if (data.length !== 1) {
      console.log("Expecting array of length 1");
      return false;
    }
    const content = data[0];
    if (content.nodes === undefined || content.edges === undefined) {
      console.log("Expecting properties 'nodes' and 'edges'");
      return false;
    }
    return true;
  }

  function isPath(content) {
    return (content != null && content.edges !== undefined && content.vertices !== undefined);
  }

  function pathAdapter(query) {
    return `LET resPath=(${query}) 
LET nodes = 
  (FOR v IN FLATTEN(resPath[*].vertices[*])
     RETURN DISTINCT { id : v._id, label : v.${LabelAttr} })
LET edges = 
  (FOR e IN FLATTEN(resPath[*].edges[*])
     RETURN DISTINCT { source : e._from, target : e._to })
RETURN { nodes, edges }`;
  }

  function isEdge(content) {
    return (content != null && content._from !== undefined && content._to !== undefined);
  }


 function edgeAdapter(query) {
    return `LET resEdges=(${query})
LET edges = (FOR e IN resEdges FILTER e._from != null AND e._to != null RETURN { source : e._from, target : e._to })
LET nodes = (FOR vid IN UNIQUE(UNION(edges[*].source, edges[*].target)) LET v = DOCUMENT(vid) RETURN { id : vid, label : v.${LabelAttr} })
return { nodes, edges }`;
  }

  const execute = async () => { 
    const db = new Database({
      url: URL,
      databaseName: DatabaseName,
      auth: { username: "root", password: "" }
    });
    const cursor = await db.query(queryValue)
      .catch(function (err) {
        setResultValue(err.message);
    });
    if (cursor) {
      let allResults = await cursor.all();

      // if the query does not return data in expected format
      // try to adapt and rerun it 
      if (!isValidGraphData(allResults)) {
        let adaptedQuery = null;
        if (isPath(allResults[0])) {
          adaptedQuery = pathAdapter(queryValue);
        } else if (isEdge(allResults[0])) {
          adaptedQuery = edgeAdapter(queryValue);
        }
        if (adaptedQuery != null) {
          const cursor = await db.query(adaptedQuery)
            .catch(function (err) {
              setResultValue(err.message);
          });
          if (cursor) {
            allResults = await cursor.all();
          }
        }
      }

      const result = JSON.stringify(allResults, null, 2);
      setResultValue(result);

      if (isValidGraphData(allResults)) {
        setGraphData(allResults[0]);
      }
    }
  };

  const loadSample = async () => { 
    const db = new Database({
      url: URL,
      databaseName: DatabaseName,
      auth: { username: "root", password: "" }
    });
    if (await db.collection("Node").exists()) {
      await db.collection("Node").drop();
    }
    if (await db.collection("Edge").exists()) {
      await db.collection("Edge").drop();
    }
    await db.createCollection("Node");
    await db.createEdgeCollection("Edge");
    await db.query(LoadSampleNodesQuery)
      .catch(function (err) {
        setResultValue(err.message);
    });
    await db.query(LoadSampleEdgesQuery)
      .catch(function (err) {
        setResultValue(err.message);
    });
  };

  return (
    <>
      <div className={styles.header}>
        <button 
          className={styles.button}
          onClick={execute}
        >
          Execute
        </button>
        <button 
          className={styles.button}
          onClick={loadSample}
        >
          Load Sample
        </button>
      </div>
      <SplitPane 
        style={{ marginTop: "60px" }}
        split="horizontal" 
        minSize={"30%"}
        onDragFinished={(height) => {
          setHeightValue(`${height}px`);
        }}
      >
        <SplitPane
          split="vertical"
          minSize={"50%"}
        >
          <AqlEditor 
            height={heightValue} 
            value={queryValue}
            onChange={setQueryValue}
          />
          <JsonEditor 
            height={heightValue} 
            value={resultValue}
          />
        </SplitPane>
        <GraphView
          data={graphData}
        />
      </SplitPane>
    </>
  );
}

export default App;

