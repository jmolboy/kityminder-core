KityMinder.registerModule( "LayoutModule", function () {
	kity.extendClass( Minder, {
		addLayoutStyle: function ( name, style ) {
			if ( !this._layoutStyles ) this._layoutStyles = {};
			this._layoutStyles[ name ] = style;
		},
		getLayoutStyle: function ( name ) {
			return this._layoutStyles[ name ];
		},
		getCurrentStyle: function () {
			var _root = this.getRoot();
			return _root.getData( "currentstyle" );
		},
		setCurrentStyle: function ( name ) {
			var _root = this.getRoot();
			_root.setData( "currentstyle", name );
			return name;
		},
		renderNode: function ( node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).renderNode.call( this, node );
		},
		initStyle: function () {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).initStyle.call( this );
		},
		appendChildNode: function ( parent, node, index ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendChildNode.call( this, parent, node, index );
		},
		appendSiblingNode: function ( sibling, node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).appendSiblingNode.call( this, sibling, node );
		},
		removeNode: function ( nodes ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).removeNode.call( this, nodes );
		},
		updateLayout: function ( node ) {
			var curStyle = this.getCurrentStyle();
			this.getLayoutStyle( curStyle ).updateLayout.call( this, node );
		}
	} );
	kity.extendClass( MinderNode, {
		setLayout: function ( k, v ) {
			if ( this.setData( 'layout' ) === undefined ) {
				this.setData( 'layout', {} );
			}
			var _pros = this.getLayout();
			Utils.extend( _pros, {
				k: v
			} );
			this.setData( 'layout', _pros );
		},
		getLayout: function ( k ) {
			if ( k === undefined ) {
				return this.getData( 'layout' );
			}
			return this.getData( 'layout' )[ k ];
		},
		clearLayout: function () {
			this.setData( 'layout', {} );
		}
	} );
	var switchLayout = function ( km, style ) {
		var _root = km.getRoot();
		km.getRenderContainer().clear();
		_root.preTraverse( function ( n ) {
			n.clearLayout();
			n.setPoint();
			n.getRenderContainer().clear();
		} );
		km.setCurrentStyle( style );
		km.initStyle();
		return style;
	};
	var SwitchLayoutCommand = kity.createClass( "SwitchLayoutCommand", ( function () {
		return {
			base: Command,
			execute: switchLayout
		};
	} )() );
	var AppendChildNodeCommand = kity.createClass( "AppendChildNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				var parent = km.getSelectedNode();
				km.appendChildNode( parent, node );
				km.select( node, true );
				return node;
			}
		};
	} )() );
	var AppendSiblingNodeCommand = kity.createClass( "AppendSiblingNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km, node ) {
				var selectedNode = km.getSelectedNode();
				if ( selectedNode.isRoot() ) {
					node.setType( "main" );
					km.appendChildNode( selectedNode, node );
				} else {
					node.setType( "sub" );
					km.appendSiblingNode( selectedNode, node );
				}
				km.select( node, true );
				return node;
			}
		};
	} )() );
	var RemoveNodeCommand = kity.createClass( "RemoveNodeCommand", ( function () {
		return {
			base: Command,
			execute: function ( km ) {
				var selectedNodes = km.getSelectedNodes();
				var _buffer = [];
				for ( var i = 0; i < selectedNodes.length; i++ ) {
					_buffer.push( selectedNodes[ i ] );
				}
				while ( _buffer.length !== 1 ) {
					var parent = _buffer[ 0 ].getParent();
					if ( parent && _buffer.indexOf( parent ) === -1 ) _buffer.push( parent );
					_buffer.shift();
				}
				km.removeNode( selectedNodes );
				km.select( _buffer[ 0 ] );
			}
		};
	} )() );

	return {
		"commands": {
			"appendchildnode": AppendChildNodeCommand,
			"appendsiblingnode": AppendSiblingNodeCommand,
			"removenode": RemoveNodeCommand,
			"switchlayout": SwitchLayoutCommand
		},
		"events": {
			"ready": function () {
				switchLayout( this, this.getOptions( 'layoutstyle' ) );
			}
		},
		"defaultOptions": {
			"layoutstyle": "default"
		}
	};
} );