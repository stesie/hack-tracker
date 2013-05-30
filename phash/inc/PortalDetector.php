<?php

class PortalDetector {
	protected $_screenConfig;
	protected $_portals = array();

	function __construct(ScreenConfiguration_Interface $screenConfig) {
		$this->_screenConfig = $screenConfig;
	}

	function train(Iterator $list) {
		foreach($list as $file) {
			if($file->isDir() || !$file->isReadable()) {
				continue;
			}

			$portalId = $file->getBasename();

			$pi = new PortalImage($this->_screenConfig, $file->getPathname());
			$this->_portals[$portalId] = $pi->getHash();
		}
	}

	function findPortalId(AbstractPortalImage $pi) {
		$findHash = $pi->getHash();

		$matches = array();
		foreach($this->_portals as $portalId => $hash) {
			$matches[$portalId] = ph_image_dist($findHash, $hash);
		}

		asort($matches);
		$matches = array_slice($matches, 0, 2);

		if(reset($matches) > 15) {
			return null;
		}

		if(end($matches) < 15) {
			return null;
		}

		return reset(array_keys($matches));
	}
}
