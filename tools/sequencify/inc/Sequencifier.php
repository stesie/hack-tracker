<?php

require_once __DIR__.'/Portal.php';
require_once __DIR__.'/Hack.php';

class Sequencifier {
	protected $_conn;
	protected $_portals = array();

	function __construct($conn) {
		$this->_conn = $conn;
	}

	function load($nickName) {
		$docs = $this->_conn->getTempView(json_encode(array(
					"map" => 'function(doc) {
								if(doc.hacker.name !== "'.$nickName.'") {
								  return;
								}

								if(typeof doc.hack.portal !== "object") {
								  /* portal already assigned, nothing to do. */
								  return;
								}

								emit(doc._id, {
									"portal": doc.hack.portal.id,
									"timestamp": doc.timestamp,
									"hack": doc["derived-info"].hack,
									"multihack": doc["derived-info"].multihack
								});
							  }',
						)));

		foreach($docs->rows as $data) {
			$this->addHack(
					$data->id,
					$data->value->portal,
					$data->value->timestamp,
					isset($data->value->hack) ? $data->value->hack : null,
					$data->value->multihack
				);
		}

	}

	function addHack($docId, $portalId, $timestamp, $hackSeq, $multihackSeq) {
		if(!isset($this->_portals[$portalId])) {
			$this->_portals[$portalId] = new Portal($portalId);
		}

		$portal = $this->_portals[$portalId];

		$hack = new Hack($this->_conn, $docId, $timestamp, $hackSeq, $multihackSeq);
		$portal->addHack($hack);
	}

	function __call($calledName, $args) {
		foreach($this->_portals as $portal) {
			call_user_func_array(array($portal, $calledName), $args);
		}
	}
};
