module.exports = function( Microbe )
{
    var trigger, _shortSelector, selectorRegex   = /(?:[\s]*\.([\w-_\.]*)|#([\w-_]*)|([^#\.<][\w-_]*)|(<[\w-_#\.]*>))/g;

    /**
     * Build
     *
     * builds and returns the final microbe
     *
     * @param  {arr}                _elements           array of elements
     * @param  {str}                _selector           selector
     *
     * @return {[type]}           [description]
     */
    function _build( _elements, _selector )
    {
        var i = 0, lenI = _elements.length;

        for ( ; i < lenI; i++ )
        {
            this[ i ] = _elements[ i ];
        }

        this.selector    = _selector;
        this.length      = i;

        return this;
    }


    /**
     * Contains
     *
     * checks if a given element is a child of _scope
     *
     * @param  {[type]} _el        [description]
     * @param  {[type]} _scope     [description]
     *
     * @return {[type]}            [description]
     */
    function _contains( _el, _scope )
    {
        var parent = _el.parentNode;

        while ( parent !== document && parent !== _scope )
        {
            parent = parent.parentNode || _scope.parentNode;
        }

        if ( parent === document )
        {
            return false;
        }

        return true;
    }


    /**
     * Get Selector
     *
     * returns the css selector from an element
     *
     * @param  {DOM Element}        _el         DOM element
     *
     * @return {string}                         css selector
     */
    function _getSelector( _el )
    {
        var getSelectorString = function( _elm )
        {
            if ( _elm && _elm.tagName )
            {
                var tag = _elm.tagName.toLowerCase(),
                id      = ( _elm.id ) ? '#' + _elm.id : '',
                clss    = ( _elm.className.length > 0 ) ? '.' + _elm.className : '';
                clss    = clss.replace( /[\s]+/g, '.' );

                return tag + id + clss;
            }

            // document or window
            return '';
        };

        if ( _el.nodeType === 1 )
        {
            return getSelectorString( _el );
        }
        else
        {
            var _selector, selectors = [];

            for ( var i = 0, lenI = _el.length; i < lenI; i++ )
            {
                _selector = getSelectorString( _el[ i ] );

                if ( selectors.indexOf( _selector ) === -1 )
                {
                    selectors.push( _selector );
                }
            }

            return selectors.join( ', ' );
        }
    }


    /**
     * Class Microbe
     *
     * Constructor.
     * Either selects or creates an HTML element and wraps in into an Microbe instance.
     * Usage:   µ('div#test')   ---> selection
     *          µ('<div#test>') ---> creation
     *
     * @param   _selector   string or HTMLElement   HTML selector
     * @param   _scope      HTMLElement             scope to look inside
     * @param   _elements   HTMLElement(s)          elements to fill Microbe with (optional)
     *
     * @return  Microbe
    */
    Microbe.core.__init__ =  function( _selector, _scope, _elements )
    {
        _selector = _selector || '';

        if ( _selector.nodeType === 1 || Object.prototype.toString.call( _selector ) === '[object Array]' ||
            _selector === window || _selector === document )
        {
            _elements = _selector;
            _selector = _getSelector( _elements );
        }

        _scope = _scope === undefined ?  document : _scope;
        var scopeNodeType   = _scope.nodeType,
            nodeType        = ( _selector ) ? _selector.nodeType || typeof _selector : null;

        if ( !( this instanceof Microbe.core.__init__ ) )
        {
            return new Microbe.core.__init__( _selector, _scope, _elements );
        }

        if ( _elements )
        {
            if ( Object.prototype.toString.call( _elements ) === '[object Array]' )
            {
                return _build.call( this, _elements, _selector );
            }
            else
            {
                return _build.call( this, [ _elements ], _selector );
            }
        }
        else
        {
            if ( ( !_selector || typeof _selector !== 'string' ) ||
                ( scopeNodeType !== 1 && scopeNodeType !== 9 ) )
            {
                return _build.call( this, [], _selector );
            }

            var resultsRegex = _selector.match( selectorRegex );

            if ( resultsRegex && resultsRegex.length === 1 )
            {
                trigger = resultsRegex[0][0];
                _shortSelector = _selector.slice( 1 );

                if ( trigger === '<' )
                {
                    return Microbe.core.create( _selector.substring( 1, _selector.length - 1 ) );
                }
                else if ( trigger === '.' )
                {
                    var _classesCount   = ( _selector || '' ).slice( 1 ).split( '.' ).length;

                    if ( _classesCount === 1 )
                    {
                        return _build.call( this, _scope.getElementsByClassName( _shortSelector ), _selector );
                    }
                }
                else if ( trigger === '#' )
                {
                    var _id = document.getElementById( _shortSelector );

                    if ( ! _id )
                    {
                        return _build.call( this, [], _selector );
                    }

                    if ( scopeNodeType === 9 )
                    {
                        if ( _id.parentNode && ( _id.id === _selector ) )
                        {
                            return _build.call( this, [ _id ], _selector );
                        }
                    }
                    else // scope not document
                    {
                        if ( _scope.ownerDocument && _contains( _id, _scope ) )
                        {
                            return _build.call( this, [ _id ], _selector );
                        }
                    }
                }
                else // if ( _tagSelector ) // && ! _idSelector && ! _classSelector )
                {
                    return _build.call( this, _scope.getElementsByTagName( _selector ), _selector );
                }
            }
        }
        return _build.call( this, _scope.querySelectorAll( _selector ), _selector );
    };

    Microbe.core.__init__.prototype = Microbe.core;
};