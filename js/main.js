/* jshint esversion: 6 */
/* globals oLogger:true */

'use strict';

/*
    Hiding logic by IIFE-function
*/

oLogger.logOff();

;( function($, undefined) {
// 'use strict';
// jQuery-based util-functions ...

/*  Method: Add(Bind) a node with its subtree to another one located either on the DOM-hierachy of the document or a new building tree
    Argument(s) :
        <$node2Add>  - a node to be added
        <$where2AddTo> - a node of a tree (or the DOM-hierachy) where to bind a node to
        <wayOfBinding> - ['append', 0, undefined, null] || ['first'] || ['before'] || [ 'after' ]
            where
                { 'append', and alternatives } => means AppendChild-mode, i.e. to become the last element of the <where2AddTo>
                { 'first' } => means Insert as the first child of <where2AddTo>
                { 'before' } => means InsertBefore-mode
                { 'after' } => means InsertBefore-mode with respect to nextSibling-element

*/
    function jqAddElement($node2Add, $where2AddTo, wayOfBinding = 'append') {
// 'use strict';
        oLogger.log('Start of <addElement> method');

        let $htmlElement = null;

        switch (wayOfBinding) {
            case 'append':
            case (0 || undefined || null):
                $where2AddTo.append( $node2Add );
                break;
            case 'first':
                $where2AddTo.prepend( $node2Add );
                break;
            case 'before':
                $where2AddTo.before( $node2Add );
                break;
            case 'after':
                $where2AddTo.after( $node2Add );
                break;
        }

        oLogger.log('End of <addElement> method');
        return $htmlElement;
    }

    function jqNewElement(tagName = null, id = null, className = null, text = null, elPropsObj = null) {
        // 'use strict';

        oLogger.log('Start of <newElement> method');

        // an HTML-element to be created
        let $htmlEl = null;

        // Ideally, I have to parse thr string 'tagName'
        //  N.B. !!! I could create a method to parse the phrase with preliminary convertion an argument to String
        //if(tagName.trim().split(/\s+/,1)) {
        if( tagName ) {
            $htmlEl = $( `<${tagName}>` );

            if( id ) {
                $htmlEl.prop( 'id', id );
            }

            if( className ) {
                if( typeof( className ) === 'string' ) {
                    $htmlEl.addClass( className );
                } else if( Array.isArray(className) ) {
                    $htmlEl.addClass( className.join( ' ' ) );
                }

            }

            if( text ) {
//                let textNode = document.createTextNode(text);
                $htmlEl.text( text );
            }

            if( elPropsObj && typeof( elPropsObj ) === 'object' ) {
                for( const propName in elPropsObj ) {
                    // a more reliable variant ...
                    if( Object.prototype.hasOwnProperty.call( elPropsObj, propName ) ) {
                    // the standard method ...
                    // if( elPropsObj.hasOwnProperty( propName ) ) {
                        if( propName === 'dataset' && typeof( elPropsObj[ propName ] === 'object' ) ) {
                            // let datasetObj = elPropsObj[ propName ];
                            const datasetObj = elPropsObj[ propName ];
                            for( const datasetProperty in datasetObj ) {
                                if( Object.prototype.hasOwnProperty.call( datasetObj, datasetProperty ) ) {
                                    // $htmlEl.data( datasetProperty, datasetObj[ datasetProperty ] );
                                    $htmlEl.get( 0 ).dataset[ datasetProperty ] = datasetObj[ datasetProperty ];
                                }
                            }
                        } else {
                            $htmlEl.prop( propName, elPropsObj[ propName ] );
                        }

                    }
                }
            }

        } else {
            oLogger.log( 'A <tagName> argument is <empty> !!!' );
        }

        oLogger.log( 'End of <newElement> method' );
        return $htmlEl;
    }

    // let UIcheckbox = function(id = null, selected=false, disabled=null, hovered=false, controlName=null, controlValue=null, tabIndex=null, formId=null) {
    // };

    function styleUICheckboxes($checkboxContainer = null) {
        oLogger.log('Start of <styleUICheckboxes> method');

        if( !$checkboxContainer ) { return; }

        const $cbList = $checkboxContainer.find( '.uiset-cb-input_uk-std' );

        let $cbContainerTemplate = jqNewElement( 'span', null, 'uiset-cb-input__js-wrapper' );
        // const $cbContainerTemplate = jqNewElement( 'span', null, 'uiset-cb-input__js-wrapper' );

        $cbList.each( function() {
            const $checkBox = $( this );
            const $cbOriContainer = $checkBox.parent();
            const $cbNewContainer = $cbContainerTemplate.clone();

            const isItChecked = $checkBox.prop( 'checked' );
            const isItDisabled = $checkBox.prop( 'disabled' );
            if( isItChecked ) {
                if( isItDisabled ) {
                    $cbNewContainer.addClass( 'uiset-cb-input__js-wrapper_checked_disabled' );
                } else {
                    $cbNewContainer.addClass( 'uiset-cb-input__js-wrapper_checked' );
                }
            } else if( isItDisabled ) {
                $cbNewContainer.addClass( 'uiset-cb-input__js-wrapper_disabled' );
            }

            $cbNewContainer.append( $checkBox );
            $cbOriContainer.append( $cbNewContainer );


            $cbNewContainer.on( 'change', '.uiset-cb-input_uk-std', null, analyzeCheckboxChange );
            $cbNewContainer.on( 'click', null, null, analyzeCheckboxWrapper );

        } );

        $cbContainerTemplate.remove();

        function analyzeCheckboxWrapper(event) {
            oLogger.log('Start of <analyzeCheckboxWrapper> method');

            if( event.currentTarget === event.target ) {
            // if( this === event.target ) {
                // const $cbWrapper = $( this );
                const $cbWrapper = $( event.currentTarget );

                const $cbOriginal = $cbWrapper.children().first();

                // const isItChecked = $cbOriginal.prop( 'checked' );
                const isItDisabled = $cbOriginal.prop( 'disabled' );

                oLogger.log( `event.type = ${event.type} class=${event.target.className} ` );
                oLogger.log( `event.target.checked = ${event.target.checked}` );
                // console.dir( event.target );

                if( !isItDisabled ) {
                    setTimeout(
                        function () {
                            $cbOriginal.prop( 'checked', !$cbOriginal.prop( 'checked' ) );
                            $cbOriginal.trigger( 'change' );
                            // $cbOriginal.trigger( 'click' );
                        },
                        0
                    );
                }   // eof !isItDisabled

            }   // eof this === event.target

            oLogger.log('End of <analyzeCheckboxWrapper> method');

        }

        function analyzeCheckboxChange(event) {
            oLogger.log('Start of <analyzeCheckboxChange> method');

            oLogger.log( `event.type = ${event.type} class=${event.target.className} ` );
            oLogger.log( `event.target.checked = ${event.target.checked}` );
            // console.dir( event.target );

            const $checkBox = $( event.currentTarget );
            // const $checkBox = $( this );
            const $cbWrapper = $checkBox.parent();

            const isItChecked = $checkBox.prop( 'checked' );
            const isItDisabled = $checkBox.prop( 'disabled' );

            if( isItDisabled ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }

            if( isItChecked ) {
                $cbWrapper.addClass( 'uiset-cb-input__js-wrapper_checked' );
            } else {
                $cbWrapper.removeClass( 'uiset-cb-input__js-wrapper_checked' );
            }

            oLogger.log('End of <analyzeCheckboxChange> method');
        }

        oLogger.log('End of <styleUICheckboxes> method');

        return true;
    }   // eof analyzeCheckboxChange

/*    const menuTree_00_ori = [
        // Root - Level
        'Item 01',
        'Item 02',
        {   // the 1st level
            menuTitle : 'Item 03',
            subMenu : [
                'Item 03-01',
                'Item 03-02',
                'Item 03-03',
                'Item 03-04',
                {   // the 2nd level
                    menuTitle : 'Item 03-05',
                    subMenu : [
                        'Item 03-05-01',
                        'Item 03-05-02',
                        'Item 03-05-03',
                        'Item 03-05-04',
                        'Item 03-05-05',
                        'Item 03-05-06',
                    ]
                }
            ]
        },
        'Item 04',
        'Item 05',
    ];
*/


    // const menuTree_01 = [
    //     // Root - Level
    //     'Item 01',
    //     'Item 02',
    //     {   // the 1st level
    //         menuTitle : 'Item 03',
    //         subMenu : [
    //             'Item 03-01',
    //             'Item 03-02',
    //             'Item 03-03',
    //             'Item 03-04',
    //             {   // the 2nd level
    //                 menuTitle : 'Item 03-05',
    //                 subMenu : [
    //                     'Item 03-05-01',
    //                     'Item 03-05-02',
    //                     'Item 03-05-03',
    //                     'Item 03-05-04',
    //                     // 'Item 03-05-05',
    //                     // 'Item 03-05-06',
    //                 ]
    //             },
    //             'Item 03-06',
    //             'Item 03-07',
    //             'Item 03-08',
    //             'Item 03-09',
    //             {   // the 2nd level
    //                 menuTitle : 'Item 03-10',
    //                 subMenu : [
    //                     'Item 03-10-01',
    //                     'Item 03-10-02',
    //                     'Item 03-10-03',
    //                     'Item 03-10-04',
    //                 ]
    //             },
    //             'Item 03-11',
    //             'Item 03-12',
    //         ]
    //     },
    //     'Item 04',
    //     {   // the 1st level
    //         menuTitle : 'Item 05',
    //         subMenu : [
    //             'Item 05-01',
    //             'Item 05-02',
    //             'Item 05-03',
    //             'Item 05-04',
    //             {   // the 2nd level
    //                 menuTitle : 'Item 05-05',
    //                 subMenu : [
    //                     'Item 05-05-01',
    //                     'Item 05-05-02',
    //                     'Item 05-05-03',
    //                     {   // the 3rd level
    //                         menuTitle : 'Item 05-05-04',
    //                         subMenu : [
    //                             'Item 05-05-04-01',
    //                             'Item 05-05-04-02',
    //                             'Item 05-05-04-03',
    //                             'Item 05-05-04-04',
    //                         ]
    //                     },
    //                     'Item 05-05-05',
    //                 ]
    //             },
    //         ],
    //     },
    //     'Item 06'
    // ];

    const menuTree_02 = [
        // Root - Level
        'Item 01',
        'Item 02',
        {   // the 1st level
            menuTitle : 'Item 03',
            subMenu : [
                'Item 03-01',
                'Item 03-02',
                'Item 03-03',
                'Item 03-04',
                {   // the 2nd level
                    menuTitle : 'Item 03-05',
                    subMenu : [
                        {
                            menuTitle : 'Item 03-05-01',
                            subMenu : [
                                'Item 03-05-01-01',
                                'Item 03-05-01-02',
                                'Item 03-05-01-03',
                                'Item 03-05-01-04',
                                'Item 03-05-01-05',
                            ]
                        },
                        // 'Item 03-05-01',
                        'Item 03-05-02',
                        'Item 03-05-03',
                        {
                            menuTitle : 'Item 03-05-04',
                            subMenu : [
                                'Item 03-05-04-01',
                                'Item 03-05-04-02',
                                'Item 03-05-04-03',
                                {
                                    menuTitle : 'Item 03-05-04-04',
                                    subMenu : [
                                        'Item 03-05-04-04-01',
                                        'Item 03-05-04-04-02',
                                        'Item 03-05-04-04-03',
                                    ]
                                },
                                'Item 03-05-04-05',
                                'Item 03-05-04-06',
                                'Item 03-05-04-07',
                                'Item 03-05-04-08',
                            ]
                        },
                        {
                            menuTitle : 'Item 03-05-05',
                            subMenu : [
                                'Item 03-05-05-01',
                                'Item 03-05-05-02',
                                'Item 03-05-05-03',
                                'Item 03-05-05-04',
                                'Item 03-05-05-05',
                            ]
                        },
                        // 'Item 03-05-05',
                        // 'Item 03-05-06',
                    ]
                },
                'Item 03-06',
                'Item 03-07',
                'Item 03-08',
                'Item 03-09',
                {   // the 2nd level
                    menuTitle : 'Item 03-10',
                    subMenu : [
                        'Item 03-10-01',
                        'Item 03-10-02',
                        'Item 03-10-03',
                        'Item 03-10-04',
                    ]
                },
                'Item 03-11',
                'Item 03-12',
            ]
        },
        'Item 04',
        {   // the 1st level
            menuTitle : 'Item 05',
            subMenu : [
                'Item 05-01',
                'Item 05-02',
                'Item 05-03',
                'Item 05-04',
                {   // the 2nd level
                    menuTitle : 'Item 05-05',
                    subMenu : [
                        'Item 05-05-01',
                        'Item 05-05-02',
                        'Item 05-05-03',
                        {   // the 3rd level
                            menuTitle : 'Item 05-05-04',
                            subMenu : [
                                'Item 05-05-04-01',
                                'Item 05-05-04-02',
                                'Item 05-05-04-03',
                                'Item 05-05-04-04',
                            ]
                        },
                        'Item 05-05-05',
                    ]
                },
            ],
        },
        'Item 06'
    ];

    function JQUIMenu(menuHierachy = null) {
        oLogger.log('Start of <JQUIMenu> method');

        let isMenuTreeBuilt = false;
        if( !$.isArray( menuHierachy ) ) {
            oLogger.log('End of <JQUIMenu> method');
        }

        const CLASS_ROOT_MENU = 'menu';
        const CLASS_ROOT_MENUITEM = 'menu__item';
        const CLASS_ROOT_ITEMTITLE = 'item__name';
        const CLASS_ROOT_SUBMENU_ICON = 'root-submenu__sign';

        const CLASS_SUB_MENU = 'submenu';
        const CLASS_SUB_MENU_LEVEL_ONE = 'level-one';
        const CLASS_SUB_MENUITEM = 'submenu__item';
        const CLASS_SUB_ITEMTITLE = 'submenu-item__name';

        const CLASS_SUBMENU_ICON = 'submenu__sign';
        /* A level of sub-menu navigation :
            0   - sub-menu on the root Menu
            1+  - other pop-up menus
        */
        const SUBMENU_ROOT = 0;

        const $menuTree = makeSubMenu( menuHierachy, SUBMENU_ROOT );

        // const CLASS_POP_UP_MENU = 'pop-up';
        // const DATASET_SUB_MENU_LEVEL = 'submenuLevel';

        // const POP_UP__MENU_CLOSING_THRESHOLD = 700; // ms
        // const POP_UP__MENU_CLOSING_THRESHOLD = 900; // ms
        const POP_UP__MENU_CLOSING_THRESHOLD = 1000; // ms
        // const POP_UP__MENU_CLOSING_THRESHOLD = 1700; // ms

        // const HOVER_STATE_ENTER = 1;
        // const HOVER_STATE_LEAVE = 2;

        const popUpMenu = {
            // popUpMenuEnabled : false,
            isOn : false,

            /*  = Trace the Level of a Pop-Up menu which can become Current/Open or which is already Open !
                = When a mouse-device enters into a new 'submenu'-container the levelMarker is increased at value of one.
                = The same way, when the mouse leaves some container the levelmarker is decreased at value of one.

                = It is changed dynamically while the mouse-device is moving outside the 'current' submenu-container for which the corresponding submenu can be closed after time thresold expiration.
            */
            levelMarker : null,
            hoveredContainer : null,
            lastHoveredState : null,

            $currentMenuContainer : null,
            $currentMenu : null,
            $currentHierachyFirstLevelContainer : null,

            isSubmenuClosingPhase : null,
            closeMenuTimerId : null,

        };

        let logStatCounter = 0;

        function makeSubMenu(branch, whichLevel = SUBMENU_ROOT) {
            oLogger.log('Start of <makeSubMenu> method');

            let menuClass = null,
                menuItemClass = null,
                itemTitleClass = null;

            if( whichLevel === SUBMENU_ROOT ) {
                [ menuClass, menuItemClass, itemTitleClass ] = [ CLASS_ROOT_MENU, CLASS_ROOT_MENUITEM, [ CLASS_ROOT_ITEMTITLE ] ];
            } else {
                [ menuClass, menuItemClass, itemTitleClass ] = [ CLASS_SUB_MENU, CLASS_SUB_MENUITEM, [ CLASS_SUB_ITEMTITLE ] ];
            }

            const $ulContainer = jqNewElement( 'ul', null, menuClass, null,
                { dataset : { submenuLevel : whichLevel } } );
                // { dataset : { [DATASET_SUB_MENU_LEVEL]: whichLevel } } );


            for( let itemCounter = 0, menuLength = branch.length; itemCounter < menuLength; itemCounter++ ) {
                const currentItem = branch[ itemCounter ];

                const $listEl = jqNewElement( 'li', null, menuItemClass );

                let itemTitle = null;
                let $subMenu = null;
                let currentItemTitleClass = itemTitleClass.slice();

                switch( typeof( currentItem ) ) {
                    case 'string':
                        itemTitle = currentItem;
                        break;
                    case 'object':
                        itemTitle = currentItem.menuTitle;

                        if( whichLevel === SUBMENU_ROOT) {
                            currentItemTitleClass.push( CLASS_ROOT_SUBMENU_ICON );

                        } else {
                            currentItemTitleClass.push( CLASS_SUBMENU_ICON );
                        }

                        $subMenu = makeSubMenu( currentItem.subMenu, whichLevel + 1 );
                        jqAddElement( $subMenu, $listEl );

                        if(whichLevel === 1 ) {
                            $ulContainer.addClass( CLASS_SUB_MENU_LEVEL_ONE );
                        }

                        // Events mounting
                        $listEl.on( 'mouseenter', null, null, upPopUpMenu );
                        $listEl.on( 'mouseleave', null, null, downPopUpMenu );

                        break;
                } // eof typeof( currentItem )

                const $itemEl = jqNewElement( 'a', null, currentItemTitleClass, itemTitle );

                jqAddElement( $itemEl, $listEl, 'first' );
                jqAddElement( $listEl, $ulContainer );


            }   // eof for(...)

            oLogger.log('End of <makeSubMenu> method');

            return $ulContainer;

        }   //eof makeSubMenu()

        function upPopUpMenu(event) {
            oLogger.log('Start of <upPopUpMenu> method');
            oLogger.log( `event.type = ${event.type}` );
            oLogger.log( `event.curTarget.CHILD.dataset = ${event.currentTarget.lastElementChild.dataset.submenuLevel}` );

            let $menuContainer = $( event.currentTarget );

            popUpMenu.levelMarker = parseInt( event.currentTarget.lastElementChild.dataset.submenuLevel );
            // popUpMenu.levelMarker = parseInt( event.currentTarget.dataset[ DATASET_SUB_MENU_LEVEL ] );

            // let hoveredMenuLevel = parseInt( event.currentTarget.lastElementChild.dataset.submenuLevel );

            // if( 0 && popUpMenu.isSubmenuClosingPhase ) {
            // if( popUpMenu.isSubmenuClosingPhase ) {
            //     // else if( popUpMenu.lastHoveredState === HOVER_STATE_ENTER ) {
            //     oLogger.log( `==> popUpMenu.lastHoveredState<${popUpMenu.lastHoveredState}> AND HOVER_STATE_ENTER<${HOVER_STATE_ENTER}>` );
            //
            //     if( popUpMenu.lastHoveredState === HOVER_STATE_ENTER ) {
            //         oLogger.log( `==>hoveredMenuLevel<${hoveredMenuLevel}> AND levelMarker<${popUpMenu.levelMarker}>` );
            //         if( hoveredMenuLevel < popUpMenu.levelMarker ) {
            //
            //             $menuContainer = $( popUpMenu.hoveredContainer );
            //             // popUpMenu.levelMarker = IT STAYS THE SAME from the last ENTER-event phase !!!!
            //
            //             oLogger.log( `==> hoveredMenuLevel<${hoveredMenuLevel}> < popUpMenu.levelMarker<${popUpMenu.levelMarker}>` );
            //             oLogger.log('End of <upPopUpMenu> method {middle} ');
            //             return;
            //         }
            //
            //     }
            //
            //     if( popUpMenu.lastHoveredState === HOVER_STATE_LEAVE ) {
            //
            //         popUpMenu.lastHoveredState = HOVER_STATE_ENTER;
            //         popUpMenu.levelMarker = hoveredMenuLevel;
            //
            //         popUpMenu.hoveredContainer = event.currentTarget;
            //     }
            //
            //
            // } else { // isSubmenuClosingPhase == FALSE
            //     popUpMenu.lastHoveredState = HOVER_STATE_ENTER;
            //     popUpMenu.levelMarker = hoveredMenuLevel;
            //     popUpMenu.hoveredContainer = event.currentTarget;
            // }


            // There is no active Pop-Up menu at the moment ...
            if( !popUpMenu.isOn ) {
                popUpMenu.isOn = true;

                popUpMenu.$currentHierachyFirstLevelContainer = setCurrentMenu( $menuContainer );

                enablePopMenu();

            } else {
                // Check the presence of Submenu Closing phase
                if( popUpMenu.isSubmenuClosingPhase ) {
                    oLogger.log( 'WE HAVE STARTED < Closing Phase >');

                    // We have returned to the same Pop-Up Menu less than the established time-threshold
                    if( $menuContainer.get( 0 ) === popUpMenu.$currentMenuContainer.get( 0 ) ) {
                        if ( popUpMenu.closeMenuTimerId ) {
                            resetCloseMenuTimer();

                            oLogger.log( `we have RETURN-ed and cleared the timer` );
                        }
                    } else {
                        /* = The mouse-device has hovered over another submenu hierachy !!!!

                        = At first, We should close all the current Pop-Up submenu hierachy
                        = Then, we initialize the new submenu hierachy.
                        = After that, we have to show it !
                        */
                        if( parseInt( $menuContainer.get( 0 ).lastElementChild.dataset.submenuLevel ) === 1 &&
                            $menuContainer.get( 0 ) !== popUpMenu.$currentHierachyFirstLevelContainer.get( 0 )
                        ) {
                            oLogger.log( `HOVER-ED over another SUB-MENU hierachy !!!! ` );
                            resetCloseMenuTimer();

                            /* ATTENTION !!
                                Reaching "ZERO-Level" RESETS all popUpMenu<PROPs> !!!!
                            */
                            closeMenu( SUBMENU_ROOT );
                            setCurrentMenu( $menuContainer );

                            // Inhale New LIFE !!!!!!!!!!!
                            popUpMenu.isOn = true;
                            popUpMenu.$currentHierachyFirstLevelContainer = setCurrentMenu( $menuContainer );


                            enablePopMenu();
                            oLogger.log( `=> END of HOVER-ED over another SUB-MENU hierachy !! ` );
                        }

                        if( $.contains(
                                $menuContainer.get( 0 ),
                                popUpMenu.$currentMenuContainer.get( 0 )
                            )
                        ) {
                            oLogger.log( `CONTAINS($menuContainer.get( 0 ),
                                            popUpMenu.$currentMenuContainer.get( 0 ))` );


                            oLogger.log( `==> END of CONTAINS($menuContainer.get( 0 ),
                                            popUpMenu.$currentMenuContainer.get( 0 ))` );
                        }


                        /*  = A mouse-device has moved over a submenu container
                            which has the same HierachyFirstLevelContainer
                            as the current submenu has !

                            = I suppose that the current submenu container and the hovered one
                                can be either SIBLINGs or the hovered one is located at the first level of the submenu hierachy !
                        */
                        if( $.contains(
                                popUpMenu.$currentHierachyFirstLevelContainer.get( 0 ),
                                $menuContainer.get( 0 )

                            )
                        ) {
                            resetCloseMenuTimer();

                            closeMenu( parseInt( $menuContainer.parent().get( 0 ).dataset.submenuLevel ) );
                            // closeMenu( parseInt( $menuContainer.get( 0 ).parentElement.dataset.submenuLevel ) );

                            setCurrentMenu( $menuContainer );
                            enablePopMenu();
                        }


                    }
                } // eof if( popUpMenu.isSubmenuClosingPhase )
                //  popUpMenu.isSubmenuClosingPhase == FALSE
                else {
                    // A mouse-device has moved over its child's sub-menu container !
                    if( $.contains( popUpMenu.$currentMenuContainer.get( 0 ), $menuContainer.get( 0 ) ) ) {
                        setCurrentMenu( $menuContainer );
                        enablePopMenu();
                    }

                }
            }


            logMenuState01( event.currentTarget, 'END of POPuP' );

            oLogger.log('End of <upPopUpMenu> method');

        } // eof EventHandler:: <upPopUpMenu>

        function downPopUpMenu(event) {
            oLogger.log('Start of <downPopUpMenu> method');
            oLogger.log( `event.type = ${event.type}` );
            // oLogger.log( `event.curTarget.CHILD.dataset = ${event.currentTarget.lastElementChild.dataset.submenuLevel}` );

            popUpMenu.levelMarker = -1 + parseInt( event.currentTarget.lastElementChild.dataset.submenuLevel );
            // popUpMenu.lastHoveredState = HOVER_STATE_LEAVE;


            // oLogger.log( `==>lastHoveredState<${popUpMenu.lastHoveredState}> AND levelMarker<${popUpMenu.levelMarker}>` );
            // logMenuState01( event.currentTarget, '{ down to level }' );

            // Check the presence of Submenu Closing phase
            if( popUpMenu.isSubmenuClosingPhase ) {
                // oLogger.log( `RETURN START from <IF popUpMenu.isSubmenuClosingPhase>` );
                //
                // oLogger.log( `if( popUpMenu.isSubmenuClosingPhase = ${popUpMenu.isSubmenuClosingPhase}` );
                // oLogger.log( `closeMenuTimerId = ${popUpMenu.closeMenuTimerId}` );
                //
                // oLogger.log( `RETURN END from <IF popUpMenu.isSubmenuClosingPhase>` );

                return;
            }

            if( popUpMenu.isOn ) {

                popUpMenu.isSubmenuClosingPhase = true;
                // oLogger.log( `IF popupMenu <IS ON ??> : phase = ${popUpMenu.isSubmenuClosingPhase}` );
                // logMenuState01( event.currentTarget );

                popUpMenu.closeMenuTimerId = setTimeout(
                    closeMenuOnTimer,
                    POP_UP__MENU_CLOSING_THRESHOLD
                );
            }

            oLogger.log('End of <downPopUpMenu> method');

        } // eof EventHandler:: <downPopUpMenu>

        function closeMenuOnTimer() {

            oLogger.log('Start of <closeMenuOnTimer> method');

            // const levelMarker = popUpMenu.levelMarker;
            const currentMenuAfterClosedOne = closeMenu( popUpMenu.levelMarker );

            if( currentMenuAfterClosedOne ) {
                setCurrentMenu( $( currentMenuAfterClosedOne.parentElement ) );
            }

            // !!!!!!!!!!!!!!!!!!!!!!!
            resetCloseMenuTimer();

            oLogger.log('End of <closeMenuOnTimer> method');
        }

        function setCurrentMenu($newMenu) {
            popUpMenu.$currentMenuContainer = $newMenu;
            popUpMenu.$currentMenu = popUpMenu.$currentMenuContainer.children().last();

            return popUpMenu.$currentMenuContainer;
        }


        function enablePopMenu($menu2bActivated = popUpMenu.$currentMenu) {
            // $menu2bActivated.addClass( CLASS_POP_UP_MENU );

            $menu2bActivated.show( 150 );
            // $menu2bActivated.slideDown( 220 );

            // $menu2bActivated.slideDown(
            //     {
            //         duration: 120,
            //         // easing: 'swing',
            //
            //         // easing: 'easeInBack',
            //         // easing: 'easeInOutBack',
            //         easing : 'easeInCubic',
            //         // easing : 'easeOutQuart',
            //     }
            // );

            // $menu2bActivated.show(
            //     {
            //         // duration : '250',
            //         duration : 250,
            //         // easing : 'swift',
            //     // 'easeInCirc',
            //         easing : 'easeInBack',
            //         // easing : 'easeInOutBack',
            //         // easing : 'easeInOutQuint',
            //     }
            // );

        }

        function resetPopUpMenu() {
            oLogger.log('Start of <resetPopUpMenu> method');

            popUpMenu.isOn = false;
            popUpMenu.levelMarker = null;

            popUpMenu.hoveredContainer = null;
            popUpMenu.lastHoveredState = null;

            popUpMenu.$currentMenuContainer = null;
            popUpMenu.$currentMenu = null;
            popUpMenu.$curHierachyfirstLevelMenu = null;

            popUpMenu.isSubmenuClosingPhase = null;
            popUpMenu.closeMenuTimerId = null;

            // popUpMenu.isAnotherSubmenuHierachy = null;

            oLogger.log('End of <resetPopUpMenu> method');
        }

        /* returns
            :: an UL-element || null ,
            :: In other words, a sub-menu which became 'current' after another one and its possible descendants were closed
        */
        function closeMenu(menuLevelBoundary) {
            oLogger.log('Start of <closeMenu> method');

            let menu2bClosed = popUpMenu.$currentMenu.get( 0 );

            oLogger.log( `closeMenu(menuLevelBoundary = ${menuLevelBoundary})` );
            logMenuState01( menu2bClosed.parentElement, 'START of CloseMENU' );

            while( parseInt( menu2bClosed.dataset.submenuLevel ) > menuLevelBoundary ) {
                // menu2bClosed.classList.remove( CLASS_POP_UP_MENU );

                // $( menu2bClosed ).hide( '450' );
                // $( menu2bClosed ).hide( '150' );
                $( menu2bClosed ).slideUp( '500' );
                // $( menu2bClosed ).slideUp( '150' );


                if( parseInt( menu2bClosed.dataset.submenuLevel ) - 1 === 0 ) {
                    // All submenus have been closed
                    resetPopUpMenu();
                    menu2bClosed = null;

                    break;
                }

                menu2bClosed = menu2bClosed.parentElement.parentElement;

                if( menu2bClosed === undefined ) {
                    logMenuState01( menu2bClosed.parentElement, 'END of CloseMENU <undefined>' );
                }
            }

            // All submenus have been closed
            // if( menu2bClosed.dataset.submenuLevel === 0 ) {
            //     resetPopUpMenu();
            // }

            if( menu2bClosed ) {
                logMenuState01( menu2bClosed.parentElement, 'END of CloseMENU' );
            }
            oLogger.log('End of <closeMenu> method');

            return menu2bClosed;
        }

        function resetCloseMenuTimer() {
            oLogger.log('Start of <resetCloseMenuTimer> method');

            clearTimeout( popUpMenu.closeMenuTimerId );

            popUpMenu.closeMenuTimerId = null;
            popUpMenu.isSubmenuClosingPhase = false;

            oLogger.log('End of <resetCloseMenuTimer> method');
        }

        function logMenuState01(menuContainer, messagePrefix = '') {
            oLogger.log( `--------------------- logStatCounter = <${++logStatCounter}> -----` );
            oLogger.log( `${messagePrefix} => menuContainer<UL> tagName< ${menuContainer.lastElementChild.tagName} > dataset< ${menuContainer.lastElementChild.dataset.submenuLevel} >` );
            // console.log( menuContainer );
            // oLogger.log( `${messagePrefix} => popUpMenu.$currentMenuContainer.DATASet = ${popUpMenu.$currentMenuContainer.get( 0 ).lastElementChild.dataset.submenuLevel}` );
            oLogger.log( `${messagePrefix} => popUpMenu.levelMarker = ${popUpMenu.levelMarker}` );
            oLogger.log( `${messagePrefix} => popUpMenu.isSubmenuClosingPhase = ${popUpMenu.isSubmenuClosingPhase}` );
            oLogger.log( `${messagePrefix} => closeMenuTimerId = ${popUpMenu.closeMenuTimerId}` );

        }

        this.getUIMenuDOMTree = function ()  {
            return $menuTree;
        };

        JQUIMenu.prototype.toString = function () {
            return ' :: TooltipForm ';
        };



        isMenuTreeBuilt = true;
        oLogger.log('End of <JQUIMenu> method');
    }


// jQuery-based DOMContentLoaded-event handling ...
$( function() {

    // Setting up Our Carousel ...
    let $jCarousel = $( '.jcarousel' );
    // jCarousel.jcarousel({
    //         // Configuration goes here
    // });

    // a test-query ...
    // let $jCList = $jCarousel.jcarousel({
    //     list: '.carousel__list'
    // });
    // oLogger.log( `$jCList = ${$jCList}` );

    $jCarousel.jcarousel({
        // transitions : false,
        // transitions : true,
        transitions: {
                transforms : true,
                transforms3d : true,
                easing : 'ease'
        }
    });

    $jCarousel.jcarousel({
        // wrap : 'both',
        wrap : 'circular',
    });

    $jCarousel.jcarousel({
        // animation: 'slow'
        // animation: 'fast'

        animation: {
            duration: 800,
            easing:   'linear',
            complete: function() {
                }
        }
    });


    // setTimeout( function() {
    //         oLogger.log( '$jCarousel.jcarousel(\'scroll\', \'+=2\');' );
    //
    //         $jCarousel.jcarousel( 'scroll', '+=2' );
    //         // $jCarousel.jcarousel( 'scroll', '4' );
    //     },
    //     1400
    // );

    let $jCarouselNavPrev = $( '.jcarousel-prev' );
    $jCarouselNavPrev.jcarouselControl({
        target: '-=1'
    });
    let $jCarouselNavNext = $( '.jcarousel-next' );
    $jCarouselNavNext.jcarouselControl({
        target: '+=1'
    });

    let $jCarouselNavPage = $( '.jcarousel-pagination' );
    $jCarouselNavPage
        .on('jcarouselpagination:active', 'a', function() {
            $(this).addClass('active_page');
        })
        .on('jcarouselpagination:inactive', 'a', function() {
            $(this).removeClass('active_page');
        }).
        jcarouselPagination();
    // only a kind of a test
    // $jCarouselNavPage.children().first().next().next().trigger( 'click' )

    /*
        Select Box Factory code definitions ...
    */

    /* 'Select Box Factory' based  SELECT-element */
    // A sample from the SBF manual ...
    // let dropdown = new sFac({
    // 	id : "fromMemory",
    // 	container : "dropdownContainer"
    // });

    // var dropdownType1 = new sFac({
    let dropdownType1 = new sFac({
    	id : "dropdownType1",
    	container : "dropdownContainerWidget",
        // Here we set the path for some needed pictures
    	coreImages : ['.css/select/clear.gif','css/select/eraser.gif'],
    	// coreImages : ["clear.gif","eraser.gif"],

        /*
            classes :
                an array of used classes
                default (the default classes used by the select box):
                    [   "uiSelectBox",
                        "uiSelectBoxToggle",
                        "uiSelectBoxChoice",
                        "uiSelectBoxStack"
                    ]
        */
        classes : [
            'uiSelectBox_uk',
            'uiSelectBoxToggle_uk',
            'uiSelectBoxChoice_uk',
            'uiSelectBoxStack_uk'
        ],
        width: 160, // '10rem',
    	// width: 140,
    	toggleStyle : 'closed',
    	eraser: true,
    	type : 'dropdown',
    	maxSize: 4,
    	// maxSize: 6,
    	choices :
    		[
                /* Choices' parameters ( 6 ones ) :
                    id, title, display name, isItSelected(bool),
                    stateNumber of {0/default, 1, 2...},
                    an array of details that allow sift to work

                    N.B. It seems the 2nd parameter is not used as the Title !
                    By the way, the DOM title parameter definiton shows the content of the title attribute correctly !
                */
                ['default','default theme','Default',true,0,[]],
                ['uk_theme','UK theme','United Kingdom',false,0,[]],
                ['twrbridge_theme','Tower Bridge theme','Tower Bridge',false,0,[]],
    		]
    });

    /*  eof Select Box Factory code definitions ...    */
    styleUICheckboxes( $( '.js-cb-menu' ) );

    // debugger;
    const $menuUI01 = new JQUIMenu( menuTree_02 );
    $( '.menu' ).first().replaceWith( $menuUI01.getUIMenuDOMTree() );

    console.clear();

} ); // eof DOMContentLoaded event handling

}(jQuery) );   // eof IIFE-function
