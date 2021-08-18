import { RendererStyleFlags3, isProceduralRenderer } from '../interfaces/renderer';
import { NO_CHANGE } from '../tokens';
import { getRootContext } from '../util';
import { BoundPlayerFactory } from './player_factory';
import { addPlayerInternal, allocPlayerContext, createEmptyStylingContext, getPlayerContext } from './util';
var EMPTY_ARR = [];
var EMPTY_OBJ = {};
/**
 * Creates a styling context template where styling information is stored.
 * Any styles that are later referenced using `updateStyleProp` must be
 * passed in within this function. Initial values for those styles are to
 * be declared after all initial style properties are declared (this change in
 * mode between declarations and initial styles is made possible using a special
 * enum value found in `definition.ts`).
 *
 * @param initialStyleDeclarations a list of style declarations and initial style values
 *    that are used later within the styling context.
 *
 *    -> ['width', 'height', SPECIAL_ENUM_VAL, 'width', '100px']
 *       This implies that `width` and `height` will be later styled and that the `width`
 *       property has an initial value of `100px`.
 *
 * @param initialClassDeclarations a list of class declarations and initial class values
 *    that are used later within the styling context.
 *
 *    -> ['foo', 'bar', SPECIAL_ENUM_VAL, 'foo', true]
 *       This implies that `foo` and `bar` will be later styled and that the `foo`
 *       class will be applied to the element as an initial class since it's true
 */
export function createStylingContextTemplate(initialClassDeclarations, initialStyleDeclarations, styleSanitizer, onlyProcessSingleClasses) {
    var initialStylingValues = [null];
    var context = createEmptyStylingContext(null, styleSanitizer, initialStylingValues);
    // we use two maps since a class name might collide with a CSS style prop
    var stylesLookup = {};
    var classesLookup = {};
    var totalStyleDeclarations = 0;
    if (initialStyleDeclarations) {
        var hasPassedDeclarations = false;
        for (var i = 0; i < initialStyleDeclarations.length; i++) {
            var v = initialStyleDeclarations[i];
            // this flag value marks where the declarations end the initial values begin
            if (v === 1 /* VALUES_MODE */) {
                hasPassedDeclarations = true;
            }
            else {
                var prop = v;
                if (hasPassedDeclarations) {
                    var value = initialStyleDeclarations[++i];
                    initialStylingValues.push(value);
                    stylesLookup[prop] = initialStylingValues.length - 1;
                }
                else {
                    totalStyleDeclarations++;
                    stylesLookup[prop] = 0;
                }
            }
        }
    }
    // make where the class offsets begin
    context[4 /* ClassOffsetPosition */] = totalStyleDeclarations;
    var initialStaticClasses = onlyProcessSingleClasses ? [] : null;
    if (initialClassDeclarations) {
        var hasPassedDeclarations = false;
        for (var i = 0; i < initialClassDeclarations.length; i++) {
            var v = initialClassDeclarations[i];
            // this flag value marks where the declarations end the initial values begin
            if (v === 1 /* VALUES_MODE */) {
                hasPassedDeclarations = true;
            }
            else {
                var className = v;
                if (hasPassedDeclarations) {
                    var value = initialClassDeclarations[++i];
                    initialStylingValues.push(value);
                    classesLookup[className] = initialStylingValues.length - 1;
                    initialStaticClasses && initialStaticClasses.push(className);
                }
                else {
                    classesLookup[className] = 0;
                }
            }
        }
    }
    var styleProps = Object.keys(stylesLookup);
    var classNames = Object.keys(classesLookup);
    var classNamesIndexStart = styleProps.length;
    var totalProps = styleProps.length + classNames.length;
    // *2 because we are filling for both single and multi style spaces
    var maxLength = totalProps * 4 /* Size */ * 2 + 8 /* SingleStylesStartPosition */;
    // we need to fill the array from the start so that we can access
    // both the multi and the single array positions in the same loop block
    for (var i = 8 /* SingleStylesStartPosition */; i < maxLength; i++) {
        context.push(null);
    }
    var singleStart = 8 /* SingleStylesStartPosition */;
    var multiStart = totalProps * 4 /* Size */ + 8 /* SingleStylesStartPosition */;
    // fill single and multi-level styles
    for (var i = 0; i < totalProps; i++) {
        var isClassBased_1 = i >= classNamesIndexStart;
        var prop = isClassBased_1 ? classNames[i - classNamesIndexStart] : styleProps[i];
        var indexForInitial = isClassBased_1 ? classesLookup[prop] : stylesLookup[prop];
        var initialValue = initialStylingValues[indexForInitial];
        var indexForMulti = i * 4 /* Size */ + multiStart;
        var indexForSingle = i * 4 /* Size */ + singleStart;
        var initialFlag = prepareInitialFlag(prop, isClassBased_1, styleSanitizer || null);
        setFlag(context, indexForSingle, pointers(initialFlag, indexForInitial, indexForMulti));
        setProp(context, indexForSingle, prop);
        setValue(context, indexForSingle, null);
        setPlayerBuilderIndex(context, indexForSingle, 0);
        var flagForMulti = initialFlag | (initialValue !== null ? 1 /* Dirty */ : 0 /* None */);
        setFlag(context, indexForMulti, pointers(flagForMulti, indexForInitial, indexForSingle));
        setProp(context, indexForMulti, prop);
        setValue(context, indexForMulti, null);
        setPlayerBuilderIndex(context, indexForMulti, 0);
    }
    // there is no initial value flag for the master index since it doesn't
    // reference an initial style value
    var masterFlag = pointers(0, 0, multiStart) |
        (onlyProcessSingleClasses ? 16 /* OnlyProcessSingleClasses */ : 0);
    setFlag(context, 3 /* MasterFlagPosition */, masterFlag);
    setContextDirty(context, initialStylingValues.length > 1);
    if (initialStaticClasses) {
        context[6 /* PreviousOrCachedMultiClassValue */] = initialStaticClasses.join(' ');
    }
    return context;
}
/**
 * Sets and resolves all `multi` styling on an `StylingContext` so that they can be
 * applied to the element once `renderStyleAndClassBindings` is called.
 *
 * All missing styles/class (any values that are not provided in the new `styles`
 * or `classes` params) will resolve to `null` within their respective positions
 * in the context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided style values.
 * @param classesInput The key/value map of CSS class names that will be used for the update.
 * @param stylesInput The key/value map of CSS styles that will be used for the update.
 */
export function updateStylingMap(context, classesInput, stylesInput) {
    stylesInput = stylesInput || null;
    var element = context[5 /* ElementPosition */];
    var classesPlayerBuilder = classesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder(classesInput, element, 1 /* Class */) :
        null;
    var stylesPlayerBuilder = stylesInput instanceof BoundPlayerFactory ?
        new ClassAndStylePlayerBuilder(stylesInput, element, 2 /* Style */) :
        null;
    var classesValue = classesPlayerBuilder ?
        classesInput.value :
        classesInput;
    var stylesValue = stylesPlayerBuilder ? stylesInput.value : stylesInput;
    // early exit (this is what's done to avoid using ctx.bind() to cache the value)
    var ignoreAllClassUpdates = limitToSingleClasses(context) || classesValue === NO_CHANGE ||
        classesValue === context[6 /* PreviousOrCachedMultiClassValue */];
    var ignoreAllStyleUpdates = stylesValue === NO_CHANGE || stylesValue === context[7 /* PreviousMultiStyleValue */];
    if (ignoreAllClassUpdates && ignoreAllStyleUpdates)
        return;
    context[6 /* PreviousOrCachedMultiClassValue */] = classesValue;
    context[7 /* PreviousMultiStyleValue */] = stylesValue;
    var classNames = EMPTY_ARR;
    var applyAllClasses = false;
    var playerBuildersAreDirty = false;
    var classesPlayerBuilderIndex = classesPlayerBuilder ? 1 /* ClassMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, classesPlayerBuilder, 1 /* ClassMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    var stylesPlayerBuilderIndex = stylesPlayerBuilder ? 3 /* StyleMapPlayerBuilderPosition */ : 0;
    if (hasPlayerBuilderChanged(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */)) {
        setPlayerBuilder(context, stylesPlayerBuilder, 3 /* StyleMapPlayerBuilderPosition */);
        playerBuildersAreDirty = true;
    }
    // each time a string-based value pops up then it shouldn't require a deep
    // check of what's changed.
    if (!ignoreAllClassUpdates) {
        if (typeof classesValue == 'string') {
            classNames = classesValue.split(/\s+/);
            // this boolean is used to avoid having to create a key/value map of `true` values
            // since a classname string implies that all those classes are added
            applyAllClasses = true;
        }
        else {
            classNames = classesValue ? Object.keys(classesValue) : EMPTY_ARR;
        }
    }
    var classes = (classesValue || EMPTY_OBJ);
    var styleProps = stylesValue ? Object.keys(stylesValue) : EMPTY_ARR;
    var styles = stylesValue || EMPTY_OBJ;
    var classesStartIndex = styleProps.length;
    var multiStartIndex = getMultiStartIndex(context);
    var dirty = false;
    var ctxIndex = multiStartIndex;
    var propIndex = 0;
    var propLimit = styleProps.length + classNames.length;
    // the main loop here will try and figure out how the shape of the provided
    // styles differ with respect to the context. Later if the context/styles/classes
    // are off-balance then they will be dealt in another loop after this one
    while (ctxIndex < context.length && propIndex < propLimit) {
        var isClassBased_2 = propIndex >= classesStartIndex;
        var processValue = (!isClassBased_2 && !ignoreAllStyleUpdates) || (isClassBased_2 && !ignoreAllClassUpdates);
        // when there is a cache-hit for a string-based class then we should
        // avoid doing any work diffing any of the changes
        if (processValue) {
            var adjustedPropIndex = isClassBased_2 ? propIndex - classesStartIndex : propIndex;
            var newProp = isClassBased_2 ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            var newValue = isClassBased_2 ? (applyAllClasses ? true : classes[newProp]) : styles[newProp];
            var playerBuilderIndex = isClassBased_2 ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            var prop = getProp(context, ctxIndex);
            if (prop === newProp) {
                var value = getValue(context, ctxIndex);
                var flag = getPointers(context, ctxIndex);
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);
                if (hasValueChanged(flag, value, newValue)) {
                    setValue(context, ctxIndex, newValue);
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    var initialValue = getInitialValue(context, flag);
                    // there is no point in setting this to dirty if the previously
                    // rendered value was being referenced by the initial style (or null)
                    if (hasValueChanged(flag, initialValue, newValue)) {
                        setDirty(context, ctxIndex, true);
                        dirty = true;
                    }
                }
            }
            else {
                var indexOfEntry = findEntryPositionByProp(context, newProp, ctxIndex);
                if (indexOfEntry > 0) {
                    // it was found at a later point ... just swap the values
                    var valueToCompare = getValue(context, indexOfEntry);
                    var flagToCompare = getPointers(context, indexOfEntry);
                    swapMultiContextEntries(context, ctxIndex, indexOfEntry);
                    if (hasValueChanged(flagToCompare, valueToCompare, newValue)) {
                        var initialValue = getInitialValue(context, flagToCompare);
                        setValue(context, ctxIndex, newValue);
                        if (hasValueChanged(flagToCompare, initialValue, newValue)) {
                            setDirty(context, ctxIndex, true);
                            playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                            dirty = true;
                        }
                    }
                }
                else {
                    // we only care to do this if the insertion is in the middle
                    var newFlag = prepareInitialFlag(newProp, isClassBased_2, getStyleSanitizer(context));
                    playerBuildersAreDirty = playerBuildersAreDirty || !!playerBuilderIndex;
                    insertNewMultiProperty(context, ctxIndex, isClassBased_2, newProp, newFlag, newValue, playerBuilderIndex);
                    dirty = true;
                }
            }
        }
        ctxIndex += 4 /* Size */;
        propIndex++;
    }
    // this means that there are left-over values in the context that
    // were not included in the provided styles/classes and in this
    // case the  goal is to "remove" them from the context (by nullifying)
    while (ctxIndex < context.length) {
        var flag = getPointers(context, ctxIndex);
        var isClassBased_3 = (flag & 2 /* Class */) === 2 /* Class */;
        var processValue = (!isClassBased_3 && !ignoreAllStyleUpdates) || (isClassBased_3 && !ignoreAllClassUpdates);
        if (processValue) {
            var value = getValue(context, ctxIndex);
            var doRemoveValue = valueExists(value, isClassBased_3);
            if (doRemoveValue) {
                setDirty(context, ctxIndex, true);
                setValue(context, ctxIndex, null);
                // we keep the player factory the same so that the `nulled` value can
                // be instructed into the player because removing a style and/or a class
                // is a valid animation player instruction.
                var playerBuilderIndex = isClassBased_3 ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
                setPlayerBuilderIndex(context, ctxIndex, playerBuilderIndex);
                dirty = true;
            }
        }
        ctxIndex += 4 /* Size */;
    }
    // this means that there are left-over properties in the context that
    // were not detected in the context during the loop above. In that
    // case we want to add the new entries into the list
    var sanitizer = getStyleSanitizer(context);
    while (propIndex < propLimit) {
        var isClassBased_4 = propIndex >= classesStartIndex;
        var processValue = (!isClassBased_4 && !ignoreAllStyleUpdates) || (isClassBased_4 && !ignoreAllClassUpdates);
        if (processValue) {
            var adjustedPropIndex = isClassBased_4 ? propIndex - classesStartIndex : propIndex;
            var prop = isClassBased_4 ? classNames[adjustedPropIndex] : styleProps[adjustedPropIndex];
            var value = isClassBased_4 ? (applyAllClasses ? true : classes[prop]) : styles[prop];
            var flag = prepareInitialFlag(prop, isClassBased_4, sanitizer) | 1 /* Dirty */;
            var playerBuilderIndex = isClassBased_4 ? classesPlayerBuilderIndex : stylesPlayerBuilderIndex;
            context.push(flag, prop, value, playerBuilderIndex);
            dirty = true;
        }
        propIndex++;
    }
    if (dirty) {
        setContextDirty(context, true);
    }
    if (playerBuildersAreDirty) {
        setContextPlayersDirty(context, true);
    }
}
/**
 * Sets and resolves a single styling property/value on the provided `StylingContext` so
 * that they can be applied to the element once `renderStyleAndClassBindings` is called.
 *
 * Note that prop-level styling values are considered higher priority than any styling that
 * has been applied using `updateStylingMap`, therefore, when styling values are rendered
 * then any styles/classes that have been applied using this function will be considered first
 * (then multi values second and then initial values as a backup).
 *
 * @param context The styling context that will be updated with the
 *    newly provided style value.
 * @param index The index of the property which is being updated.
 * @param value The CSS style value that will be assigned
 */
export function updateStyleProp(context, index, input) {
    var singleIndex = 8 /* SingleStylesStartPosition */ + index * 4 /* Size */;
    var currValue = getValue(context, singleIndex);
    var currFlag = getPointers(context, singleIndex);
    var value = (input instanceof BoundPlayerFactory) ? input.value : input;
    // didn't change ... nothing to make a note of
    if (hasValueChanged(currFlag, currValue, value)) {
        var isClassBased_5 = (currFlag & 2 /* Class */) === 2 /* Class */;
        var element = context[5 /* ElementPosition */];
        var playerBuilder = input instanceof BoundPlayerFactory ?
            new ClassAndStylePlayerBuilder(input, element, isClassBased_5 ? 1 /* Class */ : 2 /* Style */) :
            null;
        var value_1 = (playerBuilder ? input.value : input);
        var currPlayerIndex = getPlayerBuilderIndex(context, singleIndex);
        var playerBuildersAreDirty = false;
        var playerBuilderIndex = playerBuilder ? currPlayerIndex : 0;
        if (hasPlayerBuilderChanged(context, playerBuilder, currPlayerIndex)) {
            var newIndex = setPlayerBuilder(context, playerBuilder, currPlayerIndex);
            playerBuilderIndex = playerBuilder ? newIndex : 0;
            setPlayerBuilderIndex(context, singleIndex, playerBuilderIndex);
            playerBuildersAreDirty = true;
        }
        // the value will always get updated (even if the dirty flag is skipped)
        setValue(context, singleIndex, value_1);
        var indexForMulti = getMultiOrSingleIndex(currFlag);
        // if the value is the same in the multi-area then there's no point in re-assembling
        var valueForMulti = getValue(context, indexForMulti);
        if (!valueForMulti || hasValueChanged(currFlag, valueForMulti, value_1)) {
            var multiDirty = false;
            var singleDirty = true;
            // only when the value is set to `null` should the multi-value get flagged
            if (!valueExists(value_1, isClassBased_5) && valueExists(valueForMulti, isClassBased_5)) {
                multiDirty = true;
                singleDirty = false;
            }
            setDirty(context, indexForMulti, multiDirty);
            setDirty(context, singleIndex, singleDirty);
            setContextDirty(context, true);
        }
        if (playerBuildersAreDirty) {
            setContextPlayersDirty(context, true);
        }
    }
}
/**
 * This method will toggle the referenced CSS class (by the provided index)
 * within the given context.
 *
 * @param context The styling context that will be updated with the
 *    newly provided class value.
 * @param index The index of the CSS class which is being updated.
 * @param addOrRemove Whether or not to add or remove the CSS class
 */
export function updateClassProp(context, index, addOrRemove) {
    var adjustedIndex = index + context[4 /* ClassOffsetPosition */];
    updateStyleProp(context, adjustedIndex, addOrRemove);
}
/**
 * Renders all queued styling using a renderer onto the given element.
 *
 * This function works by rendering any styles (that have been applied
 * using `updateStylingMap`) and any classes (that have been applied using
 * `updateStyleProp`) onto the provided element using the provided renderer.
 * Just before the styles/classes are rendered a final key/value style map
 * will be assembled (if `styleStore` or `classStore` are provided).
 *
 * @param lElement the element that the styles will be rendered on
 * @param context The styling context that will be used to determine
 *      what styles will be rendered
 * @param renderer the renderer that will be used to apply the styling
 * @param classesStore if provided, the updated class values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @param stylesStore if provided, the updated style values will be applied
 *    to this key/value map instead of being renderered via the renderer.
 * @returns number the total amount of players that got queued for animation (if any)
 */
export function renderStyleAndClassBindings(context, renderer, rootOrView, isFirstRender, classesStore, stylesStore) {
    var totalPlayersQueued = 0;
    if (isContextDirty(context)) {
        var flushPlayerBuilders = context[3 /* MasterFlagPosition */] & 8 /* PlayerBuildersDirty */;
        var native = context[5 /* ElementPosition */];
        var multiStartIndex = getMultiStartIndex(context);
        var styleSanitizer = getStyleSanitizer(context);
        var onlySingleClasses = limitToSingleClasses(context);
        for (var i = 8 /* SingleStylesStartPosition */; i < context.length; i += 4 /* Size */) {
            // there is no point in rendering styles that have not changed on screen
            if (isDirty(context, i)) {
                var prop = getProp(context, i);
                var value = getValue(context, i);
                var flag = getPointers(context, i);
                var playerBuilder = getPlayerBuilder(context, i);
                var isClassBased_6 = flag & 2 /* Class */ ? true : false;
                var isInSingleRegion = i < multiStartIndex;
                var readInitialValue = !isClassBased_6 || !onlySingleClasses;
                var valueToApply = value;
                // VALUE DEFER CASE 1: Use a multi value instead of a null single value
                // this check implies that a single value was removed and we
                // should now defer to a multi value and use that (if set).
                if (isInSingleRegion && !valueExists(valueToApply, isClassBased_6)) {
                    // single values ALWAYS have a reference to a multi index
                    var multiIndex = getMultiOrSingleIndex(flag);
                    valueToApply = getValue(context, multiIndex);
                }
                // VALUE DEFER CASE 2: Use the initial value if all else fails (is falsy)
                // the initial value will always be a string or null,
                // therefore we can safely adopt it incase there's nothing else
                // note that this should always be a falsy check since `false` is used
                // for both class and style comparisons (styles can't be false and false
                // classes are turned off and should therefore defer to their initial values)
                if (!valueExists(valueToApply, isClassBased_6) && readInitialValue) {
                    valueToApply = getInitialValue(context, flag);
                }
                // if the first render is true then we do not want to start applying falsy
                // values to the DOM element's styling. Otherwise then we know there has
                // been a change and even if it's falsy then it's removing something that
                // was truthy before.
                var doApplyValue = isFirstRender ? valueToApply : true;
                if (doApplyValue) {
                    if (isClassBased_6) {
                        setClass(native, prop, valueToApply ? true : false, renderer, classesStore, playerBuilder);
                    }
                    else {
                        var sanitizer = (flag & 4 /* Sanitize */) ? styleSanitizer : null;
                        setStyle(native, prop, valueToApply, renderer, sanitizer, stylesStore, playerBuilder);
                    }
                }
                setDirty(context, i, false);
            }
        }
        if (flushPlayerBuilders) {
            var rootContext = Array.isArray(rootOrView) ? getRootContext(rootOrView) : rootOrView;
            var playerContext = getPlayerContext(context);
            var playersStartIndex = playerContext[0 /* NonBuilderPlayersStart */];
            for (var i = 1 /* PlayerBuildersStartPosition */; i < playersStartIndex; i += 2 /* PlayerAndPlayerBuildersTupleSize */) {
                var builder = playerContext[i];
                var playerInsertionIndex = i + 1 /* PlayerOffsetPosition */;
                var oldPlayer = playerContext[playerInsertionIndex];
                if (builder) {
                    var player = builder.buildPlayer(oldPlayer, isFirstRender);
                    if (player !== undefined) {
                        if (player != null) {
                            var wasQueued = addPlayerInternal(playerContext, rootContext, native, player, playerInsertionIndex);
                            wasQueued && totalPlayersQueued++;
                        }
                        if (oldPlayer) {
                            oldPlayer.destroy();
                        }
                    }
                }
                else if (oldPlayer) {
                    // the player builder has been removed ... therefore we should delete the associated
                    // player
                    oldPlayer.destroy();
                }
            }
            setContextPlayersDirty(context, false);
        }
        setContextDirty(context, false);
    }
    return totalPlayersQueued;
}
/**
 * This function renders a given CSS prop/value entry using the
 * provided renderer. If a `store` value is provided then
 * that will be used a render context instead of the provided
 * renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param store an optional key/value map that will be used as a context to render styles on
 */
function setStyle(native, prop, value, renderer, sanitizer, store, playerBuilder) {
    value = sanitizer && value ? sanitizer(prop, value) : value;
    if (store || playerBuilder) {
        if (store) {
            store.setValue(prop, value);
        }
        if (playerBuilder) {
            playerBuilder.setValue(prop, value);
        }
    }
    else if (value) {
        ngDevMode && ngDevMode.rendererSetStyle++;
        isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            native['style'].setProperty(prop, value);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            native['style'].removeProperty(prop);
    }
}
/**
 * This function renders a given CSS class value using the provided
 * renderer (by adding or removing it from the provided element).
 * If a `store` value is provided then that will be used a render
 * context instead of the provided renderer.
 *
 * @param native the DOM Element
 * @param prop the CSS style property that will be rendered
 * @param value the CSS style value that will be rendered
 * @param renderer
 * @param store an optional key/value map that will be used as a context to render styles on
 */
function setClass(native, className, add, renderer, store, playerBuilder) {
    if (store || playerBuilder) {
        if (store) {
            store.setValue(className, add);
        }
        if (playerBuilder) {
            playerBuilder.setValue(className, add);
        }
    }
    else if (add) {
        ngDevMode && ngDevMode.rendererAddClass++;
        isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
            native['classList'].add(className);
    }
    else {
        ngDevMode && ngDevMode.rendererRemoveClass++;
        isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
            native['classList'].remove(className);
    }
}
function setDirty(context, index, isDirtyYes) {
    var adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    if (isDirtyYes) {
        context[adjustedIndex] |= 1 /* Dirty */;
    }
    else {
        context[adjustedIndex] &= ~1 /* Dirty */;
    }
}
function isDirty(context, index) {
    var adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (context[adjustedIndex] & 1 /* Dirty */) == 1 /* Dirty */;
}
function isClassBased(context, index) {
    var adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (context[adjustedIndex] & 2 /* Class */) == 2 /* Class */;
}
function isSanitizable(context, index) {
    var adjustedIndex = index >= 8 /* SingleStylesStartPosition */ ? (index + 0 /* FlagsOffset */) : index;
    return (context[adjustedIndex] & 4 /* Sanitize */) == 4 /* Sanitize */;
}
function pointers(configFlag, staticIndex, dynamicIndex) {
    return (configFlag & 31 /* BitMask */) | (staticIndex << 5 /* BitCountSize */) |
        (dynamicIndex << (14 /* BitCountSize */ + 5 /* BitCountSize */));
}
function getInitialValue(context, flag) {
    var index = getInitialIndex(flag);
    return context[2 /* InitialStylesPosition */][index];
}
function getInitialIndex(flag) {
    return (flag >> 5 /* BitCountSize */) & 16383 /* BitMask */;
}
function getMultiOrSingleIndex(flag) {
    var index = (flag >> (14 /* BitCountSize */ + 5 /* BitCountSize */)) & 16383 /* BitMask */;
    return index >= 8 /* SingleStylesStartPosition */ ? index : -1;
}
function getMultiStartIndex(context) {
    return getMultiOrSingleIndex(context[3 /* MasterFlagPosition */]);
}
function getStyleSanitizer(context) {
    return context[1 /* StyleSanitizerPosition */];
}
function setProp(context, index, prop) {
    context[index + 1 /* PropertyOffset */] = prop;
}
function setValue(context, index, value) {
    context[index + 2 /* ValueOffset */] = value;
}
function hasPlayerBuilderChanged(context, builder, index) {
    var playerContext = context[0 /* PlayerContext */];
    if (builder) {
        if (!playerContext || index === 0) {
            return true;
        }
    }
    else if (!playerContext) {
        return false;
    }
    return playerContext[index] !== builder;
}
function setPlayerBuilder(context, builder, insertionIndex) {
    var playerContext = context[0 /* PlayerContext */] || allocPlayerContext(context);
    if (insertionIndex > 0) {
        playerContext[insertionIndex] = builder;
    }
    else {
        insertionIndex = playerContext[0 /* NonBuilderPlayersStart */];
        playerContext.splice(insertionIndex, 0, builder, null);
        playerContext[0 /* NonBuilderPlayersStart */] +=
            2 /* PlayerAndPlayerBuildersTupleSize */;
    }
    return insertionIndex;
}
function setPlayerBuilderIndex(context, index, playerBuilderIndex) {
    context[index + 3 /* PlayerBuilderIndexOffset */] = playerBuilderIndex;
}
function getPlayerBuilderIndex(context, index) {
    return context[index + 3 /* PlayerBuilderIndexOffset */] || 0;
}
function getPlayerBuilder(context, index) {
    var playerBuilderIndex = getPlayerBuilderIndex(context, index);
    if (playerBuilderIndex) {
        var playerContext = context[0 /* PlayerContext */];
        if (playerContext) {
            return playerContext[playerBuilderIndex];
        }
    }
    return null;
}
function setFlag(context, index, flag) {
    var adjustedIndex = index === 3 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    context[adjustedIndex] = flag;
}
function getPointers(context, index) {
    var adjustedIndex = index === 3 /* MasterFlagPosition */ ? index : (index + 0 /* FlagsOffset */);
    return context[adjustedIndex];
}
function getValue(context, index) {
    return context[index + 2 /* ValueOffset */];
}
function getProp(context, index) {
    return context[index + 1 /* PropertyOffset */];
}
export function isContextDirty(context) {
    return isDirty(context, 3 /* MasterFlagPosition */);
}
export function limitToSingleClasses(context) {
    return context[3 /* MasterFlagPosition */] & 16 /* OnlyProcessSingleClasses */;
}
export function setContextDirty(context, isDirtyYes) {
    setDirty(context, 3 /* MasterFlagPosition */, isDirtyYes);
}
export function setContextPlayersDirty(context, isDirtyYes) {
    if (isDirtyYes) {
        context[3 /* MasterFlagPosition */] |= 8 /* PlayerBuildersDirty */;
    }
    else {
        context[3 /* MasterFlagPosition */] &= ~8 /* PlayerBuildersDirty */;
    }
}
function findEntryPositionByProp(context, prop, startIndex) {
    for (var i = (startIndex || 0) + 1 /* PropertyOffset */; i < context.length; i += 4 /* Size */) {
        var thisProp = context[i];
        if (thisProp == prop) {
            return i - 1 /* PropertyOffset */;
        }
    }
    return -1;
}
function swapMultiContextEntries(context, indexA, indexB) {
    var tmpValue = getValue(context, indexA);
    var tmpProp = getProp(context, indexA);
    var tmpFlag = getPointers(context, indexA);
    var tmpPlayerBuilderIndex = getPlayerBuilderIndex(context, indexA);
    var flagA = tmpFlag;
    var flagB = getPointers(context, indexB);
    var singleIndexA = getMultiOrSingleIndex(flagA);
    if (singleIndexA >= 0) {
        var _flag = getPointers(context, singleIndexA);
        var _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexA, pointers(_flag, _initial, indexB));
    }
    var singleIndexB = getMultiOrSingleIndex(flagB);
    if (singleIndexB >= 0) {
        var _flag = getPointers(context, singleIndexB);
        var _initial = getInitialIndex(_flag);
        setFlag(context, singleIndexB, pointers(_flag, _initial, indexA));
    }
    setValue(context, indexA, getValue(context, indexB));
    setProp(context, indexA, getProp(context, indexB));
    setFlag(context, indexA, getPointers(context, indexB));
    setPlayerBuilderIndex(context, indexA, getPlayerBuilderIndex(context, indexB));
    setValue(context, indexB, tmpValue);
    setProp(context, indexB, tmpProp);
    setFlag(context, indexB, tmpFlag);
    setPlayerBuilderIndex(context, indexB, tmpPlayerBuilderIndex);
}
function updateSinglePointerValues(context, indexStartPosition) {
    for (var i = indexStartPosition; i < context.length; i += 4 /* Size */) {
        var multiFlag = getPointers(context, i);
        var singleIndex = getMultiOrSingleIndex(multiFlag);
        if (singleIndex > 0) {
            var singleFlag = getPointers(context, singleIndex);
            var initialIndexForSingle = getInitialIndex(singleFlag);
            var flagValue = (isDirty(context, singleIndex) ? 1 /* Dirty */ : 0 /* None */) |
                (isClassBased(context, singleIndex) ? 2 /* Class */ : 0 /* None */) |
                (isSanitizable(context, singleIndex) ? 4 /* Sanitize */ : 0 /* None */);
            var updatedFlag = pointers(flagValue, initialIndexForSingle, i);
            setFlag(context, singleIndex, updatedFlag);
        }
    }
}
function insertNewMultiProperty(context, index, classBased, name, flag, value, playerIndex) {
    var doShift = index < context.length;
    // prop does not exist in the list, add it in
    context.splice(index, 0, flag | 1 /* Dirty */ | (classBased ? 2 /* Class */ : 0 /* None */), name, value, playerIndex);
    if (doShift) {
        // because the value was inserted midway into the array then we
        // need to update all the shifted multi values' single value
        // pointers to point to the newly shifted location
        updateSinglePointerValues(context, index + 4 /* Size */);
    }
}
function valueExists(value, isClassBased) {
    if (isClassBased) {
        return value ? true : false;
    }
    return value !== null;
}
function prepareInitialFlag(name, isClassBased, sanitizer) {
    if (isClassBased) {
        return 2 /* Class */;
    }
    else if (sanitizer && sanitizer(name)) {
        return 4 /* Sanitize */;
    }
    return 0 /* None */;
}
function hasValueChanged(flag, a, b) {
    var isClassBased = flag & 2 /* Class */;
    var hasValues = a && b;
    var usesSanitizer = flag & 4 /* Sanitize */;
    // the toString() comparison ensures that a value is checked
    // ... otherwise (during sanitization bypassing) the === comparsion
    // would fail since a new String() instance is created
    if (!isClassBased && hasValues && usesSanitizer) {
        // we know for sure we're dealing with strings at this point
        return a.toString() !== b.toString();
    }
    // everything else is safe to check with a normal equality check
    return a !== b;
}
var ClassAndStylePlayerBuilder = /** @class */ (function () {
    function ClassAndStylePlayerBuilder(factory, _element, _type) {
        this._element = _element;
        this._type = _type;
        this._values = {};
        this._dirty = false;
        this._factory = factory;
    }
    ClassAndStylePlayerBuilder.prototype.setValue = function (prop, value) {
        if (this._values[prop] !== value) {
            this._values[prop] = value;
            this._dirty = true;
        }
    };
    ClassAndStylePlayerBuilder.prototype.buildPlayer = function (currentPlayer, isFirstRender) {
        // if no values have been set here then this means the binding didn't
        // change and therefore the binding values were not updated through
        // `setValue` which means no new player will be provided.
        if (this._dirty) {
            var player = this._factory.fn(this._element, this._type, this._values, isFirstRender, currentPlayer || null);
            this._values = {};
            this._dirty = false;
            return player;
        }
        return undefined;
    };
    return ClassAndStylePlayerBuilder;
}());
export { ClassAndStylePlayerBuilder };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NfYW5kX3N0eWxlX2JpbmRpbmdzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9zdHlsaW5nL2NsYXNzX2FuZF9zdHlsZV9iaW5kaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxPQUFPLEVBQVksbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUc1RixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFdkMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDcEQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLGdCQUFnQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTFHLElBQU0sU0FBUyxHQUFVLEVBQUUsQ0FBQztBQUM1QixJQUFNLFNBQVMsR0FBeUIsRUFBRSxDQUFDO0FBRzNDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSCxNQUFNLFVBQVUsNEJBQTRCLENBQ3hDLHdCQUE0RSxFQUM1RSx3QkFBNEUsRUFDNUUsY0FBdUMsRUFBRSx3QkFBa0M7SUFDN0UsSUFBTSxvQkFBb0IsR0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxJQUFNLE9BQU8sR0FDVCx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFFMUUseUVBQXlFO0lBQ3pFLElBQU0sWUFBWSxHQUE0QixFQUFFLENBQUM7SUFDakQsSUFBTSxhQUFhLEdBQTRCLEVBQUUsQ0FBQztJQUVsRCxJQUFJLHNCQUFzQixHQUFHLENBQUMsQ0FBQztJQUMvQixJQUFJLHdCQUF3QixFQUFFO1FBQzVCLElBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLEtBQUssSUFBSSxDQUFD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WUFDZixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFTLEVBQUUsYUFBYSxFQUFFLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUNyRixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixPQUFPLE1BQU0sQ0FBQztTQUNmO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUNILGlDQUFDO0FBQUQsQ0FBQyxBQTlCRCxJQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7U3R5bGVTYW5pdGl6ZUZufSBmcm9tICcuLi8uLi9zYW5pdGl6YXRpb24vc3R5bGVfc2FuaXRpemVyJztcbmltcG9ydCB7SW5pdGlhbFN0eWxpbmdGbGFnc30gZnJvbSAnLi4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7QmluZGluZ1N0b3JlLCBCaW5kaW5nVHlwZSwgUGxheWVyLCBQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJGYWN0b3J5LCBQbGF5ZXJJbmRleH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9wbGF5ZXInO1xuaW1wb3J0IHtSZW5kZXJlcjMsIFJlbmRlcmVyU3R5bGVGbGFnczMsIGlzUHJvY2VkdXJhbFJlbmRlcmVyfSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7SW5pdGlhbFN0eWxlcywgU3R5bGluZ0NvbnRleHQsIFN0eWxpbmdGbGFncywgU3R5bGluZ0luZGV4fSBmcm9tICcuLi9pbnRlcmZhY2VzL3N0eWxpbmcnO1xuaW1wb3J0IHtMVmlld0RhdGEsIFJvb3RDb250ZXh0fSBmcm9tICcuLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtOT19DSEFOR0V9IGZyb20gJy4uL3Rva2Vucyc7XG5pbXBvcnQge2dldFJvb3RDb250ZXh0fSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtCb3VuZFBsYXllckZhY3Rvcnl9IGZyb20gJy4vcGxheWVyX2ZhY3RvcnknO1xuaW1wb3J0IHthZGRQbGF5ZXJJbnRlcm5hbCwgYWxsb2NQbGF5ZXJDb250ZXh0LCBjcmVhdGVFbXB0eVN0eWxpbmdDb250ZXh0LCBnZXRQbGF5ZXJDb250ZXh0fSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBFTVBUWV9BUlI6IGFueVtdID0gW107XG5jb25zdCBFTVBUWV9PQko6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3R5bGluZyBjb250ZXh0IHRlbXBsYXRlIHdoZXJlIHN0eWxpbmcgaW5mb3JtYXRpb24gaXMgc3RvcmVkLlxuICogQW55IHN0eWxlcyB0aGF0IGFyZSBsYXRlciByZWZlcmVuY2VkIHVzaW5nIGB1cGRhdGVTdHlsZVByb3BgIG11c3QgYmVcbiAqIHBhc3NlZCBpbiB3aXRoaW4gdGhpcyBmdW5jdGlvbi4gSW5pdGlhbCB2YWx1ZXMgZm9yIHRob3NlIHN0eWxlcyBhcmUgdG9cbiAqIGJlIGRlY2xhcmVkIGFmdGVyIGFsbCBpbml0aWFsIHN0eWxlIHByb3BlcnRpZXMgYXJlIGRlY2xhcmVkICh0aGlzIGNoYW5nZSBpblxuICogbW9kZSBiZXR3ZWVuIGRlY2xhcmF0aW9ucyBhbmQgaW5pdGlhbCBzdHlsZXMgaXMgbWFkZSBwb3NzaWJsZSB1c2luZyBhIHNwZWNpYWxcbiAqIGVudW0gdmFsdWUgZm91bmQgaW4gYGRlZmluaXRpb24udHNgKS5cbiAqXG4gKiBAcGFyYW0gaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zIGEgbGlzdCBvZiBzdHlsZSBkZWNsYXJhdGlvbnMgYW5kIGluaXRpYWwgc3R5bGUgdmFsdWVzXG4gKiAgICB0aGF0IGFyZSB1c2VkIGxhdGVyIHdpdGhpbiB0aGUgc3R5bGluZyBjb250ZXh0LlxuICpcbiAqICAgIC0+IFsnd2lkdGgnLCAnaGVpZ2h0JywgU1BFQ0lBTF9FTlVNX1ZBTCwgJ3dpZHRoJywgJzEwMHB4J11cbiAqICAgICAgIFRoaXMgaW1wbGllcyB0aGF0IGB3aWR0aGAgYW5kIGBoZWlnaHRgIHdpbGwgYmUgbGF0ZXIgc3R5bGVkIGFuZCB0aGF0IHRoZSBgd2lkdGhgXG4gKiAgICAgICBwcm9wZXJ0eSBoYXMgYW4gaW5pdGlhbCB2YWx1ZSBvZiBgMTAwcHhgLlxuICpcbiAqIEBwYXJhbSBpbml0aWFsQ2xhc3NEZWNsYXJhdGlvbnMgYSBsaXN0IG9mIGNsYXNzIGRlY2xhcmF0aW9ucyBhbmQgaW5pdGlhbCBjbGFzcyB2YWx1ZXNcbiAqICAgIHRoYXQgYXJlIHVzZWQgbGF0ZXIgd2l0aGluIHRoZSBzdHlsaW5nIGNvbnRleHQuXG4gKlxuICogICAgLT4gWydmb28nLCAnYmFyJywgU1BFQ0lBTF9FTlVNX1ZBTCwgJ2ZvbycsIHRydWVdXG4gKiAgICAgICBUaGlzIGltcGxpZXMgdGhhdCBgZm9vYCBhbmQgYGJhcmAgd2lsbCBiZSBsYXRlciBzdHlsZWQgYW5kIHRoYXQgdGhlIGBmb29gXG4gKiAgICAgICBjbGFzcyB3aWxsIGJlIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgYXMgYW4gaW5pdGlhbCBjbGFzcyBzaW5jZSBpdCdzIHRydWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0eWxpbmdDb250ZXh0VGVtcGxhdGUoXG4gICAgaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zPzogKHN0cmluZyB8IGJvb2xlYW4gfCBJbml0aWFsU3R5bGluZ0ZsYWdzKVtdIHwgbnVsbCxcbiAgICBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnM/OiAoc3RyaW5nIHwgYm9vbGVhbiB8IEluaXRpYWxTdHlsaW5nRmxhZ3MpW10gfCBudWxsLFxuICAgIHN0eWxlU2FuaXRpemVyPzogU3R5bGVTYW5pdGl6ZUZuIHwgbnVsbCwgb25seVByb2Nlc3NTaW5nbGVDbGFzc2VzPzogYm9vbGVhbik6IFN0eWxpbmdDb250ZXh0IHtcbiAgY29uc3QgaW5pdGlhbFN0eWxpbmdWYWx1ZXM6IEluaXRpYWxTdHlsZXMgPSBbbnVsbF07XG4gIGNvbnN0IGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0ID1cbiAgICAgIGNyZWF0ZUVtcHR5U3R5bGluZ0NvbnRleHQobnVsbCwgc3R5bGVTYW5pdGl6ZXIsIGluaXRpYWxTdHlsaW5nVmFsdWVzKTtcblxuICAvLyB3ZSB1c2UgdHdvIG1hcHMgc2luY2UgYSBjbGFzcyBuYW1lIG1pZ2h0IGNvbGxpZGUgd2l0aCBhIENTUyBzdHlsZSBwcm9wXG4gIGNvbnN0IHN0eWxlc0xvb2t1cDoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7fTtcbiAgY29uc3QgY2xhc3Nlc0xvb2t1cDoge1trZXk6IHN0cmluZ106IG51bWJlcn0gPSB7fTtcblxuICBsZXQgdG90YWxTdHlsZURlY2xhcmF0aW9ucyA9IDA7XG4gIGlmIChpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMpIHtcbiAgICBsZXQgaGFzUGFzc2VkRGVjbGFyYXRpb25zID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHYgPSBpbml0aWFsU3R5bGVEZWNsYXJhdGlvbnNbaV0gYXMgc3RyaW5nIHwgSW5pdGlhbFN0eWxpbmdGbGFncztcblxuICAgICAgLy8gdGhpcyBmbGFnIHZhbHVlIG1hcmtzIHdoZXJlIHRoZSBkZWNsYXJhdGlvbnMgZW5kIHRoZSBpbml0aWFsIHZhbHVlcyBiZWdpblxuICAgICAgaWYgKHYgPT09IEluaXRpYWxTdHlsaW5nRmxhZ3MuVkFMVUVTX01PREUpIHtcbiAgICAgICAgaGFzUGFzc2VkRGVjbGFyYXRpb25zID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByb3AgPSB2IGFzIHN0cmluZztcbiAgICAgICAgaWYgKGhhc1Bhc3NlZERlY2xhcmF0aW9ucykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdGlhbFN0eWxlRGVjbGFyYXRpb25zWysraV0gYXMgc3RyaW5nO1xuICAgICAgICAgIGluaXRpYWxTdHlsaW5nVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAgIHN0eWxlc0xvb2t1cFtwcm9wXSA9IGluaXRpYWxTdHlsaW5nVmFsdWVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG90YWxTdHlsZURlY2xhcmF0aW9ucysrO1xuICAgICAgICAgIHN0eWxlc0xvb2t1cFtwcm9wXSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBtYWtlIHdoZXJlIHRoZSBjbGFzcyBvZmZzZXRzIGJlZ2luXG4gIGNvbnRleHRbU3R5bGluZ0luZGV4LkNsYXNzT2Zmc2V0UG9zaXRpb25dID0gdG90YWxTdHlsZURlY2xhcmF0aW9ucztcblxuICBjb25zdCBpbml0aWFsU3RhdGljQ2xhc3Nlczogc3RyaW5nW118bnVsbCA9IG9ubHlQcm9jZXNzU2luZ2xlQ2xhc3NlcyA/IFtdIDogbnVsbDtcbiAgaWYgKGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucykge1xuICAgIGxldCBoYXNQYXNzZWREZWNsYXJhdGlvbnMgPSBmYWxzZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluaXRpYWxDbGFzc0RlY2xhcmF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdiA9IGluaXRpYWxDbGFzc0RlY2xhcmF0aW9uc1tpXSBhcyBzdHJpbmcgfCBib29sZWFuIHwgSW5pdGlhbFN0eWxpbmdGbGFncztcbiAgICAgIC8vIHRoaXMgZmxhZyB2YWx1ZSBtYXJrcyB3aGVyZSB0aGUgZGVjbGFyYXRpb25zIGVuZCB0aGUgaW5pdGlhbCB2YWx1ZXMgYmVnaW5cbiAgICAgIGlmICh2ID09PSBJbml0aWFsU3R5bGluZ0ZsYWdzLlZBTFVFU19NT0RFKSB7XG4gICAgICAgIGhhc1Bhc3NlZERlY2xhcmF0aW9ucyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSB2IGFzIHN0cmluZztcbiAgICAgICAgaWYgKGhhc1Bhc3NlZERlY2xhcmF0aW9ucykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdGlhbENsYXNzRGVjbGFyYXRpb25zWysraV0gYXMgYm9vbGVhbjtcbiAgICAgICAgICBpbml0aWFsU3R5bGluZ1ZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICBjbGFzc2VzTG9va3VwW2NsYXNzTmFtZV0gPSBpbml0aWFsU3R5bGluZ1ZhbHVlcy5sZW5ndGggLSAxO1xuICAgICAgICAgIGluaXRpYWxTdGF0aWNDbGFzc2VzICYmIGluaXRpYWxTdGF0aWNDbGFzc2VzLnB1c2goY2xhc3NOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbGFzc2VzTG9va3VwW2NsYXNzTmFtZV0gPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3R5bGVQcm9wcyA9IE9iamVjdC5rZXlzKHN0eWxlc0xvb2t1cCk7XG4gIGNvbnN0IGNsYXNzTmFtZXMgPSBPYmplY3Qua2V5cyhjbGFzc2VzTG9va3VwKTtcbiAgY29uc3QgY2xhc3NOYW1lc0luZGV4U3RhcnQgPSBzdHlsZVByb3BzLmxlbmd0aDtcbiAgY29uc3QgdG90YWxQcm9wcyA9IHN0eWxlUHJvcHMubGVuZ3RoICsgY2xhc3NOYW1lcy5sZW5ndGg7XG5cbiAgLy8gKjIgYmVjYXVzZSB3ZSBhcmUgZmlsbGluZyBmb3IgYm90aCBzaW5nbGUgYW5kIG11bHRpIHN0eWxlIHNwYWNlc1xuICBjb25zdCBtYXhMZW5ndGggPSB0b3RhbFByb3BzICogU3R5bGluZ0luZGV4LlNpemUgKiAyICsgU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb247XG5cbiAgLy8gd2UgbmVlZCB0byBmaWxsIHRoZSBhcnJheSBmcm9tIHRoZSBzdGFydCBzbyB0aGF0IHdlIGNhbiBhY2Nlc3NcbiAgLy8gYm90aCB0aGUgbXVsdGkgYW5kIHRoZSBzaW5nbGUgYXJyYXkgcG9zaXRpb25zIGluIHRoZSBzYW1lIGxvb3AgYmxvY2tcbiAgZm9yIChsZXQgaSA9IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uOyBpIDwgbWF4TGVuZ3RoOyBpKyspIHtcbiAgICBjb250ZXh0LnB1c2gobnVsbCk7XG4gIH1cblxuICBjb25zdCBzaW5nbGVTdGFydCA9IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uO1xuICBjb25zdCBtdWx0aVN0YXJ0ID0gdG90YWxQcm9wcyAqIFN0eWxpbmdJbmRleC5TaXplICsgU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb247XG5cbiAgLy8gZmlsbCBzaW5nbGUgYW5kIG11bHRpLWxldmVsIHN0eWxlc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsUHJvcHM7IGkrKykge1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IGkgPj0gY2xhc3NOYW1lc0luZGV4U3RhcnQ7XG4gICAgY29uc3QgcHJvcCA9IGlzQ2xhc3NCYXNlZCA/IGNsYXNzTmFtZXNbaSAtIGNsYXNzTmFtZXNJbmRleFN0YXJ0XSA6IHN0eWxlUHJvcHNbaV07XG4gICAgY29uc3QgaW5kZXhGb3JJbml0aWFsID0gaXNDbGFzc0Jhc2VkID8gY2xhc3Nlc0xvb2t1cFtwcm9wXSA6IHN0eWxlc0xvb2t1cFtwcm9wXTtcbiAgICBjb25zdCBpbml0aWFsVmFsdWUgPSBpbml0aWFsU3R5bGluZ1ZhbHVlc1tpbmRleEZvckluaXRpYWxdO1xuXG4gICAgY29uc3QgaW5kZXhGb3JNdWx0aSA9IGkgKiBTdHlsaW5nSW5kZXguU2l6ZSArIG11bHRpU3RhcnQ7XG4gICAgY29uc3QgaW5kZXhGb3JTaW5nbGUgPSBpICogU3R5bGluZ0luZGV4LlNpemUgKyBzaW5nbGVTdGFydDtcbiAgICBjb25zdCBpbml0aWFsRmxhZyA9IHByZXBhcmVJbml0aWFsRmxhZyhwcm9wLCBpc0NsYXNzQmFzZWQsIHN0eWxlU2FuaXRpemVyIHx8IG51bGwpO1xuXG4gICAgc2V0RmxhZyhjb250ZXh0LCBpbmRleEZvclNpbmdsZSwgcG9pbnRlcnMoaW5pdGlhbEZsYWcsIGluZGV4Rm9ySW5pdGlhbCwgaW5kZXhGb3JNdWx0aSkpO1xuICAgIHNldFByb3AoY29udGV4dCwgaW5kZXhGb3JTaW5nbGUsIHByb3ApO1xuICAgIHNldFZhbHVlKGNvbnRleHQsIGluZGV4Rm9yU2luZ2xlLCBudWxsKTtcbiAgICBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgaW5kZXhGb3JTaW5nbGUsIDApO1xuXG4gICAgY29uc3QgZmxhZ0Zvck11bHRpID1cbiAgICAgICAgaW5pdGlhbEZsYWcgfCAoaW5pdGlhbFZhbHVlICE9PSBudWxsID8gU3R5bGluZ0ZsYWdzLkRpcnR5IDogU3R5bGluZ0ZsYWdzLk5vbmUpO1xuICAgIHNldEZsYWcoY29udGV4dCwgaW5kZXhGb3JNdWx0aSwgcG9pbnRlcnMoZmxhZ0Zvck11bHRpLCBpbmRleEZvckluaXRpYWwsIGluZGV4Rm9yU2luZ2xlKSk7XG4gICAgc2V0UHJvcChjb250ZXh0LCBpbmRleEZvck11bHRpLCBwcm9wKTtcbiAgICBzZXRWYWx1ZShjb250ZXh0LCBpbmRleEZvck11bHRpLCBudWxsKTtcbiAgICBzZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgaW5kZXhGb3JNdWx0aSwgMCk7XG4gIH1cblxuICAvLyB0aGVyZSBpcyBubyBpbml0aWFsIHZhbHVlIGZsYWcgZm9yIHRoZSBtYXN0ZXIgaW5kZXggc2luY2UgaXQgZG9lc24ndFxuICAvLyByZWZlcmVuY2UgYW4gaW5pdGlhbCBzdHlsZSB2YWx1ZVxuICBjb25zdCBtYXN0ZXJGbGFnID0gcG9pbnRlcnMoMCwgMCwgbXVsdGlTdGFydCkgfFxuICAgICAgKG9ubHlQcm9jZXNzU2luZ2xlQ2xhc3NlcyA/IFN0eWxpbmdGbGFncy5Pbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXMgOiAwKTtcbiAgc2V0RmxhZyhjb250ZXh0LCBTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uLCBtYXN0ZXJGbGFnKTtcbiAgc2V0Q29udGV4dERpcnR5KGNvbnRleHQsIGluaXRpYWxTdHlsaW5nVmFsdWVzLmxlbmd0aCA+IDEpO1xuXG4gIGlmIChpbml0aWFsU3RhdGljQ2xhc3Nlcykge1xuICAgIGNvbnRleHRbU3R5bGluZ0luZGV4LlByZXZpb3VzT3JDYWNoZWRNdWx0aUNsYXNzVmFsdWVdID0gaW5pdGlhbFN0YXRpY0NsYXNzZXMuam9pbignICcpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbi8qKlxuICogU2V0cyBhbmQgcmVzb2x2ZXMgYWxsIGBtdWx0aWAgc3R5bGluZyBvbiBhbiBgU3R5bGluZ0NvbnRleHRgIHNvIHRoYXQgdGhleSBjYW4gYmVcbiAqIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgb25jZSBgcmVuZGVyU3R5bGVBbmRDbGFzc0JpbmRpbmdzYCBpcyBjYWxsZWQuXG4gKlxuICogQWxsIG1pc3Npbmcgc3R5bGVzL2NsYXNzIChhbnkgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcm92aWRlZCBpbiB0aGUgbmV3IGBzdHlsZXNgXG4gKiBvciBgY2xhc3Nlc2AgcGFyYW1zKSB3aWxsIHJlc29sdmUgdG8gYG51bGxgIHdpdGhpbiB0aGVpciByZXNwZWN0aXZlIHBvc2l0aW9uc1xuICogaW4gdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgc3R5bGUgdmFsdWVzLlxuICogQHBhcmFtIGNsYXNzZXNJbnB1dCBUaGUga2V5L3ZhbHVlIG1hcCBvZiBDU1MgY2xhc3MgbmFtZXMgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB1cGRhdGUuXG4gKiBAcGFyYW0gc3R5bGVzSW5wdXQgVGhlIGtleS92YWx1ZSBtYXAgb2YgQ1NTIHN0eWxlcyB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgdGhlIHVwZGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVN0eWxpbmdNYXAoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGNsYXNzZXNJbnB1dDoge1trZXk6IHN0cmluZ106IGFueX0gfCBzdHJpbmcgfFxuICAgICAgICBCb3VuZFBsYXllckZhY3Rvcnk8bnVsbHxzdHJpbmd8e1trZXk6IHN0cmluZ106IGFueX0+fCBOT19DSEFOR0UgfCBudWxsLFxuICAgIHN0eWxlc0lucHV0Pzoge1trZXk6IHN0cmluZ106IGFueX0gfCBCb3VuZFBsYXllckZhY3Rvcnk8bnVsbHx7W2tleTogc3RyaW5nXTogYW55fT58IE5PX0NIQU5HRSB8XG4gICAgICAgIG51bGwpOiB2b2lkIHtcbiAgc3R5bGVzSW5wdXQgPSBzdHlsZXNJbnB1dCB8fCBudWxsO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBjb250ZXh0W1N0eWxpbmdJbmRleC5FbGVtZW50UG9zaXRpb25dICFhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgY2xhc3Nlc1BsYXllckJ1aWxkZXIgPSBjbGFzc2VzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKGNsYXNzZXNJbnB1dCBhcyBhbnksIGVsZW1lbnQsIEJpbmRpbmdUeXBlLkNsYXNzKSA6XG4gICAgICBudWxsO1xuICBjb25zdCBzdHlsZXNQbGF5ZXJCdWlsZGVyID0gc3R5bGVzSW5wdXQgaW5zdGFuY2VvZiBCb3VuZFBsYXllckZhY3RvcnkgP1xuICAgICAgbmV3IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyKHN0eWxlc0lucHV0IGFzIGFueSwgZWxlbWVudCwgQmluZGluZ1R5cGUuU3R5bGUpIDpcbiAgICAgIG51bGw7XG5cbiAgY29uc3QgY2xhc3Nlc1ZhbHVlID0gY2xhc3Nlc1BsYXllckJ1aWxkZXIgP1xuICAgICAgKGNsYXNzZXNJbnB1dCBhcyBCb3VuZFBsYXllckZhY3Rvcnk8e1trZXk6IHN0cmluZ106IGFueX18c3RyaW5nPikgIS52YWx1ZSA6XG4gICAgICBjbGFzc2VzSW5wdXQ7XG4gIGNvbnN0IHN0eWxlc1ZhbHVlID0gc3R5bGVzUGxheWVyQnVpbGRlciA/IHN0eWxlc0lucHV0ICEudmFsdWUgOiBzdHlsZXNJbnB1dDtcbiAgLy8gZWFybHkgZXhpdCAodGhpcyBpcyB3aGF0J3MgZG9uZSB0byBhdm9pZCB1c2luZyBjdHguYmluZCgpIHRvIGNhY2hlIHRoZSB2YWx1ZSlcbiAgY29uc3QgaWdub3JlQWxsQ2xhc3NVcGRhdGVzID0gbGltaXRUb1NpbmdsZUNsYXNzZXMoY29udGV4dCkgfHwgY2xhc3Nlc1ZhbHVlID09PSBOT19DSEFOR0UgfHxcbiAgICAgIGNsYXNzZXNWYWx1ZSA9PT0gY29udGV4dFtTdHlsaW5nSW5kZXguUHJldmlvdXNPckNhY2hlZE11bHRpQ2xhc3NWYWx1ZV07XG4gIGNvbnN0IGlnbm9yZUFsbFN0eWxlVXBkYXRlcyA9XG4gICAgICBzdHlsZXNWYWx1ZSA9PT0gTk9fQ0hBTkdFIHx8IHN0eWxlc1ZhbHVlID09PSBjb250ZXh0W1N0eWxpbmdJbmRleC5QcmV2aW91c011bHRpU3R5bGVWYWx1ZV07XG4gIGlmIChpZ25vcmVBbGxDbGFzc1VwZGF0ZXMgJiYgaWdub3JlQWxsU3R5bGVVcGRhdGVzKSByZXR1cm47XG5cbiAgY29udGV4dFtTdHlsaW5nSW5kZXguUHJldmlvdXNPckNhY2hlZE11bHRpQ2xhc3NWYWx1ZV0gPSBjbGFzc2VzVmFsdWU7XG4gIGNvbnRleHRbU3R5bGluZ0luZGV4LlByZXZpb3VzTXVsdGlTdHlsZVZhbHVlXSA9IHN0eWxlc1ZhbHVlO1xuXG4gIGxldCBjbGFzc05hbWVzOiBzdHJpbmdbXSA9IEVNUFRZX0FSUjtcbiAgbGV0IGFwcGx5QWxsQ2xhc3NlcyA9IGZhbHNlO1xuICBsZXQgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IGZhbHNlO1xuXG4gIGNvbnN0IGNsYXNzZXNQbGF5ZXJCdWlsZGVySW5kZXggPVxuICAgICAgY2xhc3Nlc1BsYXllckJ1aWxkZXIgPyBQbGF5ZXJJbmRleC5DbGFzc01hcFBsYXllckJ1aWxkZXJQb3NpdGlvbiA6IDA7XG4gIGlmIChoYXNQbGF5ZXJCdWlsZGVyQ2hhbmdlZChcbiAgICAgICAgICBjb250ZXh0LCBjbGFzc2VzUGxheWVyQnVpbGRlciwgUGxheWVySW5kZXguQ2xhc3NNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24pKSB7XG4gICAgc2V0UGxheWVyQnVpbGRlcihjb250ZXh0LCBjbGFzc2VzUGxheWVyQnVpbGRlciwgUGxheWVySW5kZXguQ2xhc3NNYXBQbGF5ZXJCdWlsZGVyUG9zaXRpb24pO1xuICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgY29uc3Qgc3R5bGVzUGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgIHN0eWxlc1BsYXllckJ1aWxkZXIgPyBQbGF5ZXJJbmRleC5TdHlsZU1hcFBsYXllckJ1aWxkZXJQb3NpdGlvbiA6IDA7XG4gIGlmIChoYXNQbGF5ZXJCdWlsZGVyQ2hhbmdlZChcbiAgICAgICAgICBjb250ZXh0LCBzdHlsZXNQbGF5ZXJCdWlsZGVyLCBQbGF5ZXJJbmRleC5TdHlsZU1hcFBsYXllckJ1aWxkZXJQb3NpdGlvbikpIHtcbiAgICBzZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQsIHN0eWxlc1BsYXllckJ1aWxkZXIsIFBsYXllckluZGV4LlN0eWxlTWFwUGxheWVyQnVpbGRlclBvc2l0aW9uKTtcbiAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIGVhY2ggdGltZSBhIHN0cmluZy1iYXNlZCB2YWx1ZSBwb3BzIHVwIHRoZW4gaXQgc2hvdWxkbid0IHJlcXVpcmUgYSBkZWVwXG4gIC8vIGNoZWNrIG9mIHdoYXQncyBjaGFuZ2VkLlxuICBpZiAoIWlnbm9yZUFsbENsYXNzVXBkYXRlcykge1xuICAgIGlmICh0eXBlb2YgY2xhc3Nlc1ZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICBjbGFzc05hbWVzID0gY2xhc3Nlc1ZhbHVlLnNwbGl0KC9cXHMrLyk7XG4gICAgICAvLyB0aGlzIGJvb2xlYW4gaXMgdXNlZCB0byBhdm9pZCBoYXZpbmcgdG8gY3JlYXRlIGEga2V5L3ZhbHVlIG1hcCBvZiBgdHJ1ZWAgdmFsdWVzXG4gICAgICAvLyBzaW5jZSBhIGNsYXNzbmFtZSBzdHJpbmcgaW1wbGllcyB0aGF0IGFsbCB0aG9zZSBjbGFzc2VzIGFyZSBhZGRlZFxuICAgICAgYXBwbHlBbGxDbGFzc2VzID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xhc3NOYW1lcyA9IGNsYXNzZXNWYWx1ZSA/IE9iamVjdC5rZXlzKGNsYXNzZXNWYWx1ZSkgOiBFTVBUWV9BUlI7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhc3NlcyA9IChjbGFzc2VzVmFsdWUgfHwgRU1QVFlfT0JKKSBhc3tba2V5OiBzdHJpbmddOiBhbnl9O1xuICBjb25zdCBzdHlsZVByb3BzID0gc3R5bGVzVmFsdWUgPyBPYmplY3Qua2V5cyhzdHlsZXNWYWx1ZSkgOiBFTVBUWV9BUlI7XG4gIGNvbnN0IHN0eWxlcyA9IHN0eWxlc1ZhbHVlIHx8IEVNUFRZX09CSjtcblxuICBjb25zdCBjbGFzc2VzU3RhcnRJbmRleCA9IHN0eWxlUHJvcHMubGVuZ3RoO1xuICBjb25zdCBtdWx0aVN0YXJ0SW5kZXggPSBnZXRNdWx0aVN0YXJ0SW5kZXgoY29udGV4dCk7XG5cbiAgbGV0IGRpcnR5ID0gZmFsc2U7XG4gIGxldCBjdHhJbmRleCA9IG11bHRpU3RhcnRJbmRleDtcblxuICBsZXQgcHJvcEluZGV4ID0gMDtcbiAgY29uc3QgcHJvcExpbWl0ID0gc3R5bGVQcm9wcy5sZW5ndGggKyBjbGFzc05hbWVzLmxlbmd0aDtcblxuICAvLyB0aGUgbWFpbiBsb29wIGhlcmUgd2lsbCB0cnkgYW5kIGZpZ3VyZSBvdXQgaG93IHRoZSBzaGFwZSBvZiB0aGUgcHJvdmlkZWRcbiAgLy8gc3R5bGVzIGRpZmZlciB3aXRoIHJlc3BlY3QgdG8gdGhlIGNvbnRleHQuIExhdGVyIGlmIHRoZSBjb250ZXh0L3N0eWxlcy9jbGFzc2VzXG4gIC8vIGFyZSBvZmYtYmFsYW5jZSB0aGVuIHRoZXkgd2lsbCBiZSBkZWFsdCBpbiBhbm90aGVyIGxvb3AgYWZ0ZXIgdGhpcyBvbmVcbiAgd2hpbGUgKGN0eEluZGV4IDwgY29udGV4dC5sZW5ndGggJiYgcHJvcEluZGV4IDwgcHJvcExpbWl0KSB7XG4gICAgY29uc3QgaXNDbGFzc0Jhc2VkID0gcHJvcEluZGV4ID49IGNsYXNzZXNTdGFydEluZGV4O1xuICAgIGNvbnN0IHByb2Nlc3NWYWx1ZSA9XG4gICAgICAgICghaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHx8IChpc0NsYXNzQmFzZWQgJiYgIWlnbm9yZUFsbENsYXNzVXBkYXRlcyk7XG5cbiAgICAvLyB3aGVuIHRoZXJlIGlzIGEgY2FjaGUtaGl0IGZvciBhIHN0cmluZy1iYXNlZCBjbGFzcyB0aGVuIHdlIHNob3VsZFxuICAgIC8vIGF2b2lkIGRvaW5nIGFueSB3b3JrIGRpZmZpbmcgYW55IG9mIHRoZSBjaGFuZ2VzXG4gICAgaWYgKHByb2Nlc3NWYWx1ZSkge1xuICAgICAgY29uc3QgYWRqdXN0ZWRQcm9wSW5kZXggPSBpc0NsYXNzQmFzZWQgPyBwcm9wSW5kZXggLSBjbGFzc2VzU3RhcnRJbmRleCA6IHByb3BJbmRleDtcbiAgICAgIGNvbnN0IG5ld1Byb3A6IHN0cmluZyA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW25ld1Byb3BdKSA6IHN0eWxlc1tuZXdQcm9wXTtcbiAgICAgIGNvbnN0IHBsYXllckJ1aWxkZXJJbmRleCA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gY2xhc3Nlc1BsYXllckJ1aWxkZXJJbmRleCA6IHN0eWxlc1BsYXllckJ1aWxkZXJJbmRleDtcblxuICAgICAgY29uc3QgcHJvcCA9IGdldFByb3AoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgICAgaWYgKHByb3AgPT09IG5ld1Byb3ApIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIGNvbnN0IGZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBjdHhJbmRleCwgcGxheWVyQnVpbGRlckluZGV4KTtcblxuICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWcsIHZhbHVlLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICBzZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCwgbmV3VmFsdWUpO1xuICAgICAgICAgIHBsYXllckJ1aWxkZXJzQXJlRGlydHkgPSBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5IHx8ICEhcGxheWVyQnVpbGRlckluZGV4O1xuXG4gICAgICAgICAgY29uc3QgaW5pdGlhbFZhbHVlID0gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQsIGZsYWcpO1xuXG4gICAgICAgICAgLy8gdGhlcmUgaXMgbm8gcG9pbnQgaW4gc2V0dGluZyB0aGlzIHRvIGRpcnR5IGlmIHRoZSBwcmV2aW91c2x5XG4gICAgICAgICAgLy8gcmVuZGVyZWQgdmFsdWUgd2FzIGJlaW5nIHJlZmVyZW5jZWQgYnkgdGhlIGluaXRpYWwgc3R5bGUgKG9yIG51bGwpXG4gICAgICAgICAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChmbGFnLCBpbml0aWFsVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgc2V0RGlydHkoY29udGV4dCwgY3R4SW5kZXgsIHRydWUpO1xuICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5kZXhPZkVudHJ5ID0gZmluZEVudHJ5UG9zaXRpb25CeVByb3AoY29udGV4dCwgbmV3UHJvcCwgY3R4SW5kZXgpO1xuICAgICAgICBpZiAoaW5kZXhPZkVudHJ5ID4gMCkge1xuICAgICAgICAgIC8vIGl0IHdhcyBmb3VuZCBhdCBhIGxhdGVyIHBvaW50IC4uLiBqdXN0IHN3YXAgdGhlIHZhbHVlc1xuICAgICAgICAgIGNvbnN0IHZhbHVlVG9Db21wYXJlID0gZ2V0VmFsdWUoY29udGV4dCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBjb25zdCBmbGFnVG9Db21wYXJlID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBzd2FwTXVsdGlDb250ZXh0RW50cmllcyhjb250ZXh0LCBjdHhJbmRleCwgaW5kZXhPZkVudHJ5KTtcbiAgICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWdUb0NvbXBhcmUsIHZhbHVlVG9Db21wYXJlLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWxWYWx1ZSA9IGdldEluaXRpYWxWYWx1ZShjb250ZXh0LCBmbGFnVG9Db21wYXJlKTtcbiAgICAgICAgICAgIHNldFZhbHVlKGNvbnRleHQsIGN0eEluZGV4LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICBpZiAoaGFzVmFsdWVDaGFuZ2VkKGZsYWdUb0NvbXBhcmUsIGluaXRpYWxWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgICAgIHNldERpcnR5KGNvbnRleHQsIGN0eEluZGV4LCB0cnVlKTtcbiAgICAgICAgICAgICAgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IHBsYXllckJ1aWxkZXJzQXJlRGlydHkgfHwgISFwbGF5ZXJCdWlsZGVySW5kZXg7XG4gICAgICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd2Ugb25seSBjYXJlIHRvIGRvIHRoaXMgaWYgdGhlIGluc2VydGlvbiBpcyBpbiB0aGUgbWlkZGxlXG4gICAgICAgICAgY29uc3QgbmV3RmxhZyA9IHByZXBhcmVJbml0aWFsRmxhZyhuZXdQcm9wLCBpc0NsYXNzQmFzZWQsIGdldFN0eWxlU2FuaXRpemVyKGNvbnRleHQpKTtcbiAgICAgICAgICBwbGF5ZXJCdWlsZGVyc0FyZURpcnR5ID0gcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSB8fCAhIXBsYXllckJ1aWxkZXJJbmRleDtcbiAgICAgICAgICBpbnNlcnROZXdNdWx0aVByb3BlcnR5KFxuICAgICAgICAgICAgICBjb250ZXh0LCBjdHhJbmRleCwgaXNDbGFzc0Jhc2VkLCBuZXdQcm9wLCBuZXdGbGFnLCBuZXdWYWx1ZSwgcGxheWVyQnVpbGRlckluZGV4KTtcbiAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdHhJbmRleCArPSBTdHlsaW5nSW5kZXguU2l6ZTtcbiAgICBwcm9wSW5kZXgrKztcbiAgfVxuXG4gIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGVyZSBhcmUgbGVmdC1vdmVyIHZhbHVlcyBpbiB0aGUgY29udGV4dCB0aGF0XG4gIC8vIHdlcmUgbm90IGluY2x1ZGVkIGluIHRoZSBwcm92aWRlZCBzdHlsZXMvY2xhc3NlcyBhbmQgaW4gdGhpc1xuICAvLyBjYXNlIHRoZSAgZ29hbCBpcyB0byBcInJlbW92ZVwiIHRoZW0gZnJvbSB0aGUgY29udGV4dCAoYnkgbnVsbGlmeWluZylcbiAgd2hpbGUgKGN0eEluZGV4IDwgY29udGV4dC5sZW5ndGgpIHtcbiAgICBjb25zdCBmbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgY3R4SW5kZXgpO1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IChmbGFnICYgU3R5bGluZ0ZsYWdzLkNsYXNzKSA9PT0gU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICAgIGNvbnN0IHByb2Nlc3NWYWx1ZSA9XG4gICAgICAgICghaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxTdHlsZVVwZGF0ZXMpIHx8IChpc0NsYXNzQmFzZWQgJiYgIWlnbm9yZUFsbENsYXNzVXBkYXRlcyk7XG4gICAgaWYgKHByb2Nlc3NWYWx1ZSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBjdHhJbmRleCk7XG4gICAgICBjb25zdCBkb1JlbW92ZVZhbHVlID0gdmFsdWVFeGlzdHModmFsdWUsIGlzQ2xhc3NCYXNlZCk7XG4gICAgICBpZiAoZG9SZW1vdmVWYWx1ZSkge1xuICAgICAgICBzZXREaXJ0eShjb250ZXh0LCBjdHhJbmRleCwgdHJ1ZSk7XG4gICAgICAgIHNldFZhbHVlKGNvbnRleHQsIGN0eEluZGV4LCBudWxsKTtcblxuICAgICAgICAvLyB3ZSBrZWVwIHRoZSBwbGF5ZXIgZmFjdG9yeSB0aGUgc2FtZSBzbyB0aGF0IHRoZSBgbnVsbGVkYCB2YWx1ZSBjYW5cbiAgICAgICAgLy8gYmUgaW5zdHJ1Y3RlZCBpbnRvIHRoZSBwbGF5ZXIgYmVjYXVzZSByZW1vdmluZyBhIHN0eWxlIGFuZC9vciBhIGNsYXNzXG4gICAgICAgIC8vIGlzIGEgdmFsaWQgYW5pbWF0aW9uIHBsYXllciBpbnN0cnVjdGlvbi5cbiAgICAgICAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgICAgICAgIGlzQ2xhc3NCYXNlZCA/IGNsYXNzZXNQbGF5ZXJCdWlsZGVySW5kZXggOiBzdHlsZXNQbGF5ZXJCdWlsZGVySW5kZXg7XG4gICAgICAgIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBjdHhJbmRleCwgcGxheWVyQnVpbGRlckluZGV4KTtcbiAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjdHhJbmRleCArPSBTdHlsaW5nSW5kZXguU2l6ZTtcbiAgfVxuXG4gIC8vIHRoaXMgbWVhbnMgdGhhdCB0aGVyZSBhcmUgbGVmdC1vdmVyIHByb3BlcnRpZXMgaW4gdGhlIGNvbnRleHQgdGhhdFxuICAvLyB3ZXJlIG5vdCBkZXRlY3RlZCBpbiB0aGUgY29udGV4dCBkdXJpbmcgdGhlIGxvb3AgYWJvdmUuIEluIHRoYXRcbiAgLy8gY2FzZSB3ZSB3YW50IHRvIGFkZCB0aGUgbmV3IGVudHJpZXMgaW50byB0aGUgbGlzdFxuICBjb25zdCBzYW5pdGl6ZXIgPSBnZXRTdHlsZVNhbml0aXplcihjb250ZXh0KTtcbiAgd2hpbGUgKHByb3BJbmRleCA8IHByb3BMaW1pdCkge1xuICAgIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IHByb3BJbmRleCA+PSBjbGFzc2VzU3RhcnRJbmRleDtcbiAgICBjb25zdCBwcm9jZXNzVmFsdWUgPVxuICAgICAgICAoIWlzQ2xhc3NCYXNlZCAmJiAhaWdub3JlQWxsU3R5bGVVcGRhdGVzKSB8fCAoaXNDbGFzc0Jhc2VkICYmICFpZ25vcmVBbGxDbGFzc1VwZGF0ZXMpO1xuICAgIGlmIChwcm9jZXNzVmFsdWUpIHtcbiAgICAgIGNvbnN0IGFkanVzdGVkUHJvcEluZGV4ID0gaXNDbGFzc0Jhc2VkID8gcHJvcEluZGV4IC0gY2xhc3Nlc1N0YXJ0SW5kZXggOiBwcm9wSW5kZXg7XG4gICAgICBjb25zdCBwcm9wID0gaXNDbGFzc0Jhc2VkID8gY2xhc3NOYW1lc1thZGp1c3RlZFByb3BJbmRleF0gOiBzdHlsZVByb3BzW2FkanVzdGVkUHJvcEluZGV4XTtcbiAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmd8Ym9vbGVhbiA9XG4gICAgICAgICAgaXNDbGFzc0Jhc2VkID8gKGFwcGx5QWxsQ2xhc3NlcyA/IHRydWUgOiBjbGFzc2VzW3Byb3BdKSA6IHN0eWxlc1twcm9wXTtcbiAgICAgIGNvbnN0IGZsYWcgPSBwcmVwYXJlSW5pdGlhbEZsYWcocHJvcCwgaXNDbGFzc0Jhc2VkLCBzYW5pdGl6ZXIpIHwgU3R5bGluZ0ZsYWdzLkRpcnR5O1xuICAgICAgY29uc3QgcGxheWVyQnVpbGRlckluZGV4ID1cbiAgICAgICAgICBpc0NsYXNzQmFzZWQgPyBjbGFzc2VzUGxheWVyQnVpbGRlckluZGV4IDogc3R5bGVzUGxheWVyQnVpbGRlckluZGV4O1xuICAgICAgY29udGV4dC5wdXNoKGZsYWcsIHByb3AsIHZhbHVlLCBwbGF5ZXJCdWlsZGVySW5kZXgpO1xuICAgICAgZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICBwcm9wSW5kZXgrKztcbiAgfVxuXG4gIGlmIChkaXJ0eSkge1xuICAgIHNldENvbnRleHREaXJ0eShjb250ZXh0LCB0cnVlKTtcbiAgfVxuXG4gIGlmIChwbGF5ZXJCdWlsZGVyc0FyZURpcnR5KSB7XG4gICAgc2V0Q29udGV4dFBsYXllcnNEaXJ0eShjb250ZXh0LCB0cnVlKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldHMgYW5kIHJlc29sdmVzIGEgc2luZ2xlIHN0eWxpbmcgcHJvcGVydHkvdmFsdWUgb24gdGhlIHByb3ZpZGVkIGBTdHlsaW5nQ29udGV4dGAgc29cbiAqIHRoYXQgdGhleSBjYW4gYmUgYXBwbGllZCB0byB0aGUgZWxlbWVudCBvbmNlIGByZW5kZXJTdHlsZUFuZENsYXNzQmluZGluZ3NgIGlzIGNhbGxlZC5cbiAqXG4gKiBOb3RlIHRoYXQgcHJvcC1sZXZlbCBzdHlsaW5nIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBoaWdoZXIgcHJpb3JpdHkgdGhhbiBhbnkgc3R5bGluZyB0aGF0XG4gKiBoYXMgYmVlbiBhcHBsaWVkIHVzaW5nIGB1cGRhdGVTdHlsaW5nTWFwYCwgdGhlcmVmb3JlLCB3aGVuIHN0eWxpbmcgdmFsdWVzIGFyZSByZW5kZXJlZFxuICogdGhlbiBhbnkgc3R5bGVzL2NsYXNzZXMgdGhhdCBoYXZlIGJlZW4gYXBwbGllZCB1c2luZyB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgY29uc2lkZXJlZCBmaXJzdFxuICogKHRoZW4gbXVsdGkgdmFsdWVzIHNlY29uZCBhbmQgdGhlbiBpbml0aWFsIHZhbHVlcyBhcyBhIGJhY2t1cCkuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgc3R5bGUgdmFsdWUuXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBwcm9wZXJ0eSB3aGljaCBpcyBiZWluZyB1cGRhdGVkLlxuICogQHBhcmFtIHZhbHVlIFRoZSBDU1Mgc3R5bGUgdmFsdWUgdGhhdCB3aWxsIGJlIGFzc2lnbmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTdHlsZVByb3AoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsXG4gICAgaW5wdXQ6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgQm91bmRQbGF5ZXJGYWN0b3J5PHN0cmluZ3xib29sZWFufG51bGw+KTogdm9pZCB7XG4gIGNvbnN0IHNpbmdsZUluZGV4ID0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gKyBpbmRleCAqIFN0eWxpbmdJbmRleC5TaXplO1xuICBjb25zdCBjdXJyVmFsdWUgPSBnZXRWYWx1ZShjb250ZXh0LCBzaW5nbGVJbmRleCk7XG4gIGNvbnN0IGN1cnJGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuICBjb25zdCB2YWx1ZTogc3RyaW5nfGJvb2xlYW58bnVsbCA9IChpbnB1dCBpbnN0YW5jZW9mIEJvdW5kUGxheWVyRmFjdG9yeSkgPyBpbnB1dC52YWx1ZSA6IGlucHV0O1xuXG4gIC8vIGRpZG4ndCBjaGFuZ2UgLi4uIG5vdGhpbmcgdG8gbWFrZSBhIG5vdGUgb2ZcbiAgaWYgKGhhc1ZhbHVlQ2hhbmdlZChjdXJyRmxhZywgY3VyclZhbHVlLCB2YWx1ZSkpIHtcbiAgICBjb25zdCBpc0NsYXNzQmFzZWQgPSAoY3VyckZsYWcgJiBTdHlsaW5nRmxhZ3MuQ2xhc3MpID09PSBTdHlsaW5nRmxhZ3MuQ2xhc3M7XG4gICAgY29uc3QgZWxlbWVudCA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkVsZW1lbnRQb3NpdGlvbl0gIWFzIEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IHBsYXllckJ1aWxkZXIgPSBpbnB1dCBpbnN0YW5jZW9mIEJvdW5kUGxheWVyRmFjdG9yeSA/XG4gICAgICAgIG5ldyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcihcbiAgICAgICAgICAgIGlucHV0IGFzIGFueSwgZWxlbWVudCwgaXNDbGFzc0Jhc2VkID8gQmluZGluZ1R5cGUuQ2xhc3MgOiBCaW5kaW5nVHlwZS5TdHlsZSkgOlxuICAgICAgICBudWxsO1xuICAgIGNvbnN0IHZhbHVlID0gKHBsYXllckJ1aWxkZXIgPyAoaW5wdXQgYXMgQm91bmRQbGF5ZXJGYWN0b3J5PGFueT4pLnZhbHVlIDogaW5wdXQpIGFzIHN0cmluZyB8XG4gICAgICAgIGJvb2xlYW4gfCBudWxsO1xuICAgIGNvbnN0IGN1cnJQbGF5ZXJJbmRleCA9IGdldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0LCBzaW5nbGVJbmRleCk7XG5cbiAgICBsZXQgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IGZhbHNlO1xuICAgIGxldCBwbGF5ZXJCdWlsZGVySW5kZXggPSBwbGF5ZXJCdWlsZGVyID8gY3VyclBsYXllckluZGV4IDogMDtcbiAgICBpZiAoaGFzUGxheWVyQnVpbGRlckNoYW5nZWQoY29udGV4dCwgcGxheWVyQnVpbGRlciwgY3VyclBsYXllckluZGV4KSkge1xuICAgICAgY29uc3QgbmV3SW5kZXggPSBzZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQsIHBsYXllckJ1aWxkZXIsIGN1cnJQbGF5ZXJJbmRleCk7XG4gICAgICBwbGF5ZXJCdWlsZGVySW5kZXggPSBwbGF5ZXJCdWlsZGVyID8gbmV3SW5kZXggOiAwO1xuICAgICAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIHNpbmdsZUluZGV4LCBwbGF5ZXJCdWlsZGVySW5kZXgpO1xuICAgICAgcGxheWVyQnVpbGRlcnNBcmVEaXJ0eSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gdGhlIHZhbHVlIHdpbGwgYWx3YXlzIGdldCB1cGRhdGVkIChldmVuIGlmIHRoZSBkaXJ0eSBmbGFnIGlzIHNraXBwZWQpXG4gICAgc2V0VmFsdWUoY29udGV4dCwgc2luZ2xlSW5kZXgsIHZhbHVlKTtcbiAgICBjb25zdCBpbmRleEZvck11bHRpID0gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGN1cnJGbGFnKTtcblxuICAgIC8vIGlmIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZSBpbiB0aGUgbXVsdGktYXJlYSB0aGVuIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gcmUtYXNzZW1ibGluZ1xuICAgIGNvbnN0IHZhbHVlRm9yTXVsdGkgPSBnZXRWYWx1ZShjb250ZXh0LCBpbmRleEZvck11bHRpKTtcbiAgICBpZiAoIXZhbHVlRm9yTXVsdGkgfHwgaGFzVmFsdWVDaGFuZ2VkKGN1cnJGbGFnLCB2YWx1ZUZvck11bHRpLCB2YWx1ZSkpIHtcbiAgICAgIGxldCBtdWx0aURpcnR5ID0gZmFsc2U7XG4gICAgICBsZXQgc2luZ2xlRGlydHkgPSB0cnVlO1xuXG4gICAgICAvLyBvbmx5IHdoZW4gdGhlIHZhbHVlIGlzIHNldCB0byBgbnVsbGAgc2hvdWxkIHRoZSBtdWx0aS12YWx1ZSBnZXQgZmxhZ2dlZFxuICAgICAgaWYgKCF2YWx1ZUV4aXN0cyh2YWx1ZSwgaXNDbGFzc0Jhc2VkKSAmJiB2YWx1ZUV4aXN0cyh2YWx1ZUZvck11bHRpLCBpc0NsYXNzQmFzZWQpKSB7XG4gICAgICAgIG11bHRpRGlydHkgPSB0cnVlO1xuICAgICAgICBzaW5nbGVEaXJ0eSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBzZXREaXJ0eShjb250ZXh0LCBpbmRleEZvck11bHRpLCBtdWx0aURpcnR5KTtcbiAgICAgIHNldERpcnR5KGNvbnRleHQsIHNpbmdsZUluZGV4LCBzaW5nbGVEaXJ0eSk7XG4gICAgICBzZXRDb250ZXh0RGlydHkoY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHBsYXllckJ1aWxkZXJzQXJlRGlydHkpIHtcbiAgICAgIHNldENvbnRleHRQbGF5ZXJzRGlydHkoY29udGV4dCwgdHJ1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2Qgd2lsbCB0b2dnbGUgdGhlIHJlZmVyZW5jZWQgQ1NTIGNsYXNzIChieSB0aGUgcHJvdmlkZWQgaW5kZXgpXG4gKiB3aXRoaW4gdGhlIGdpdmVuIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZVxuICogICAgbmV3bHkgcHJvdmlkZWQgY2xhc3MgdmFsdWUuXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBDU1MgY2xhc3Mgd2hpY2ggaXMgYmVpbmcgdXBkYXRlZC5cbiAqIEBwYXJhbSBhZGRPclJlbW92ZSBXaGV0aGVyIG9yIG5vdCB0byBhZGQgb3IgcmVtb3ZlIHRoZSBDU1MgY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUNsYXNzUHJvcChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcixcbiAgICBhZGRPclJlbW92ZTogYm9vbGVhbiB8IEJvdW5kUGxheWVyRmFjdG9yeTxib29sZWFuPik6IHZvaWQge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID0gaW5kZXggKyBjb250ZXh0W1N0eWxpbmdJbmRleC5DbGFzc09mZnNldFBvc2l0aW9uXTtcbiAgdXBkYXRlU3R5bGVQcm9wKGNvbnRleHQsIGFkanVzdGVkSW5kZXgsIGFkZE9yUmVtb3ZlKTtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIGFsbCBxdWV1ZWQgc3R5bGluZyB1c2luZyBhIHJlbmRlcmVyIG9udG8gdGhlIGdpdmVuIGVsZW1lbnQuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3b3JrcyBieSByZW5kZXJpbmcgYW55IHN0eWxlcyAodGhhdCBoYXZlIGJlZW4gYXBwbGllZFxuICogdXNpbmcgYHVwZGF0ZVN0eWxpbmdNYXBgKSBhbmQgYW55IGNsYXNzZXMgKHRoYXQgaGF2ZSBiZWVuIGFwcGxpZWQgdXNpbmdcbiAqIGB1cGRhdGVTdHlsZVByb3BgKSBvbnRvIHRoZSBwcm92aWRlZCBlbGVtZW50IHVzaW5nIHRoZSBwcm92aWRlZCByZW5kZXJlci5cbiAqIEp1c3QgYmVmb3JlIHRoZSBzdHlsZXMvY2xhc3NlcyBhcmUgcmVuZGVyZWQgYSBmaW5hbCBrZXkvdmFsdWUgc3R5bGUgbWFwXG4gKiB3aWxsIGJlIGFzc2VtYmxlZCAoaWYgYHN0eWxlU3RvcmVgIG9yIGBjbGFzc1N0b3JlYCBhcmUgcHJvdmlkZWQpLlxuICpcbiAqIEBwYXJhbSBsRWxlbWVudCB0aGUgZWxlbWVudCB0aGF0IHRoZSBzdHlsZXMgd2lsbCBiZSByZW5kZXJlZCBvblxuICogQHBhcmFtIGNvbnRleHQgVGhlIHN0eWxpbmcgY29udGV4dCB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmVcbiAqICAgICAgd2hhdCBzdHlsZXMgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHJlbmRlcmVyIHRoZSByZW5kZXJlciB0aGF0IHdpbGwgYmUgdXNlZCB0byBhcHBseSB0aGUgc3R5bGluZ1xuICogQHBhcmFtIGNsYXNzZXNTdG9yZSBpZiBwcm92aWRlZCwgdGhlIHVwZGF0ZWQgY2xhc3MgdmFsdWVzIHdpbGwgYmUgYXBwbGllZFxuICogICAgdG8gdGhpcyBrZXkvdmFsdWUgbWFwIGluc3RlYWQgb2YgYmVpbmcgcmVuZGVyZXJlZCB2aWEgdGhlIHJlbmRlcmVyLlxuICogQHBhcmFtIHN0eWxlc1N0b3JlIGlmIHByb3ZpZGVkLCB0aGUgdXBkYXRlZCBzdHlsZSB2YWx1ZXMgd2lsbCBiZSBhcHBsaWVkXG4gKiAgICB0byB0aGlzIGtleS92YWx1ZSBtYXAgaW5zdGVhZCBvZiBiZWluZyByZW5kZXJlcmVkIHZpYSB0aGUgcmVuZGVyZXIuXG4gKiBAcmV0dXJucyBudW1iZXIgdGhlIHRvdGFsIGFtb3VudCBvZiBwbGF5ZXJzIHRoYXQgZ290IHF1ZXVlZCBmb3IgYW5pbWF0aW9uIChpZiBhbnkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTdHlsZUFuZENsYXNzQmluZGluZ3MoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHJvb3RPclZpZXc6IFJvb3RDb250ZXh0IHwgTFZpZXdEYXRhLFxuICAgIGlzRmlyc3RSZW5kZXI6IGJvb2xlYW4sIGNsYXNzZXNTdG9yZT86IEJpbmRpbmdTdG9yZSB8IG51bGwsXG4gICAgc3R5bGVzU3RvcmU/OiBCaW5kaW5nU3RvcmUgfCBudWxsKTogbnVtYmVyIHtcbiAgbGV0IHRvdGFsUGxheWVyc1F1ZXVlZCA9IDA7XG5cbiAgaWYgKGlzQ29udGV4dERpcnR5KGNvbnRleHQpKSB7XG4gICAgY29uc3QgZmx1c2hQbGF5ZXJCdWlsZGVyczogYW55ID1cbiAgICAgICAgY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSAmIFN0eWxpbmdGbGFncy5QbGF5ZXJCdWlsZGVyc0RpcnR5O1xuICAgIGNvbnN0IG5hdGl2ZSA9IGNvbnRleHRbU3R5bGluZ0luZGV4LkVsZW1lbnRQb3NpdGlvbl0gITtcbiAgICBjb25zdCBtdWx0aVN0YXJ0SW5kZXggPSBnZXRNdWx0aVN0YXJ0SW5kZXgoY29udGV4dCk7XG4gICAgY29uc3Qgc3R5bGVTYW5pdGl6ZXIgPSBnZXRTdHlsZVNhbml0aXplcihjb250ZXh0KTtcbiAgICBjb25zdCBvbmx5U2luZ2xlQ2xhc3NlcyA9IGxpbWl0VG9TaW5nbGVDbGFzc2VzKGNvbnRleHQpO1xuXG4gICAgZm9yIChsZXQgaSA9IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uOyBpIDwgY29udGV4dC5sZW5ndGg7XG4gICAgICAgICBpICs9IFN0eWxpbmdJbmRleC5TaXplKSB7XG4gICAgICAvLyB0aGVyZSBpcyBubyBwb2ludCBpbiByZW5kZXJpbmcgc3R5bGVzIHRoYXQgaGF2ZSBub3QgY2hhbmdlZCBvbiBzY3JlZW5cbiAgICAgIGlmIChpc0RpcnR5KGNvbnRleHQsIGkpKSB7XG4gICAgICAgIGNvbnN0IHByb3AgPSBnZXRQcm9wKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCBmbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaSk7XG4gICAgICAgIGNvbnN0IHBsYXllckJ1aWxkZXIgPSBnZXRQbGF5ZXJCdWlsZGVyKGNvbnRleHQsIGkpO1xuICAgICAgICBjb25zdCBpc0NsYXNzQmFzZWQgPSBmbGFnICYgU3R5bGluZ0ZsYWdzLkNsYXNzID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICBjb25zdCBpc0luU2luZ2xlUmVnaW9uID0gaSA8IG11bHRpU3RhcnRJbmRleDtcbiAgICAgICAgY29uc3QgcmVhZEluaXRpYWxWYWx1ZSA9ICFpc0NsYXNzQmFzZWQgfHwgIW9ubHlTaW5nbGVDbGFzc2VzO1xuXG4gICAgICAgIGxldCB2YWx1ZVRvQXBwbHk6IHN0cmluZ3xib29sZWFufG51bGwgPSB2YWx1ZTtcblxuICAgICAgICAvLyBWQUxVRSBERUZFUiBDQVNFIDE6IFVzZSBhIG11bHRpIHZhbHVlIGluc3RlYWQgb2YgYSBudWxsIHNpbmdsZSB2YWx1ZVxuICAgICAgICAvLyB0aGlzIGNoZWNrIGltcGxpZXMgdGhhdCBhIHNpbmdsZSB2YWx1ZSB3YXMgcmVtb3ZlZCBhbmQgd2VcbiAgICAgICAgLy8gc2hvdWxkIG5vdyBkZWZlciB0byBhIG11bHRpIHZhbHVlIGFuZCB1c2UgdGhhdCAoaWYgc2V0KS5cbiAgICAgICAgaWYgKGlzSW5TaW5nbGVSZWdpb24gJiYgIXZhbHVlRXhpc3RzKHZhbHVlVG9BcHBseSwgaXNDbGFzc0Jhc2VkKSkge1xuICAgICAgICAgIC8vIHNpbmdsZSB2YWx1ZXMgQUxXQVlTIGhhdmUgYSByZWZlcmVuY2UgdG8gYSBtdWx0aSBpbmRleFxuICAgICAgICAgIGNvbnN0IG11bHRpSW5kZXggPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoZmxhZyk7XG4gICAgICAgICAgdmFsdWVUb0FwcGx5ID0gZ2V0VmFsdWUoY29udGV4dCwgbXVsdGlJbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWQUxVRSBERUZFUiBDQVNFIDI6IFVzZSB0aGUgaW5pdGlhbCB2YWx1ZSBpZiBhbGwgZWxzZSBmYWlscyAoaXMgZmFsc3kpXG4gICAgICAgIC8vIHRoZSBpbml0aWFsIHZhbHVlIHdpbGwgYWx3YXlzIGJlIGEgc3RyaW5nIG9yIG51bGwsXG4gICAgICAgIC8vIHRoZXJlZm9yZSB3ZSBjYW4gc2FmZWx5IGFkb3B0IGl0IGluY2FzZSB0aGVyZSdzIG5vdGhpbmcgZWxzZVxuICAgICAgICAvLyBub3RlIHRoYXQgdGhpcyBzaG91bGQgYWx3YXlzIGJlIGEgZmFsc3kgY2hlY2sgc2luY2UgYGZhbHNlYCBpcyB1c2VkXG4gICAgICAgIC8vIGZvciBib3RoIGNsYXNzIGFuZCBzdHlsZSBjb21wYXJpc29ucyAoc3R5bGVzIGNhbid0IGJlIGZhbHNlIGFuZCBmYWxzZVxuICAgICAgICAvLyBjbGFzc2VzIGFyZSB0dXJuZWQgb2ZmIGFuZCBzaG91bGQgdGhlcmVmb3JlIGRlZmVyIHRvIHRoZWlyIGluaXRpYWwgdmFsdWVzKVxuICAgICAgICBpZiAoIXZhbHVlRXhpc3RzKHZhbHVlVG9BcHBseSwgaXNDbGFzc0Jhc2VkKSAmJiByZWFkSW5pdGlhbFZhbHVlKSB7XG4gICAgICAgICAgdmFsdWVUb0FwcGx5ID0gZ2V0SW5pdGlhbFZhbHVlKGNvbnRleHQsIGZsYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIGZpcnN0IHJlbmRlciBpcyB0cnVlIHRoZW4gd2UgZG8gbm90IHdhbnQgdG8gc3RhcnQgYXBwbHlpbmcgZmFsc3lcbiAgICAgICAgLy8gdmFsdWVzIHRvIHRoZSBET00gZWxlbWVudCdzIHN0eWxpbmcuIE90aGVyd2lzZSB0aGVuIHdlIGtub3cgdGhlcmUgaGFzXG4gICAgICAgIC8vIGJlZW4gYSBjaGFuZ2UgYW5kIGV2ZW4gaWYgaXQncyBmYWxzeSB0aGVuIGl0J3MgcmVtb3Zpbmcgc29tZXRoaW5nIHRoYXRcbiAgICAgICAgLy8gd2FzIHRydXRoeSBiZWZvcmUuXG4gICAgICAgIGNvbnN0IGRvQXBwbHlWYWx1ZSA9IGlzRmlyc3RSZW5kZXIgPyB2YWx1ZVRvQXBwbHkgOiB0cnVlO1xuICAgICAgICBpZiAoZG9BcHBseVZhbHVlKSB7XG4gICAgICAgICAgaWYgKGlzQ2xhc3NCYXNlZCkge1xuICAgICAgICAgICAgc2V0Q2xhc3MoXG4gICAgICAgICAgICAgICAgbmF0aXZlLCBwcm9wLCB2YWx1ZVRvQXBwbHkgPyB0cnVlIDogZmFsc2UsIHJlbmRlcmVyLCBjbGFzc2VzU3RvcmUsIHBsYXllckJ1aWxkZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzYW5pdGl6ZXIgPSAoZmxhZyAmIFN0eWxpbmdGbGFncy5TYW5pdGl6ZSkgPyBzdHlsZVNhbml0aXplciA6IG51bGw7XG4gICAgICAgICAgICBzZXRTdHlsZShcbiAgICAgICAgICAgICAgICBuYXRpdmUsIHByb3AsIHZhbHVlVG9BcHBseSBhcyBzdHJpbmcgfCBudWxsLCByZW5kZXJlciwgc2FuaXRpemVyLCBzdHlsZXNTdG9yZSxcbiAgICAgICAgICAgICAgICBwbGF5ZXJCdWlsZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXREaXJ0eShjb250ZXh0LCBpLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGZsdXNoUGxheWVyQnVpbGRlcnMpIHtcbiAgICAgIGNvbnN0IHJvb3RDb250ZXh0ID1cbiAgICAgICAgICBBcnJheS5pc0FycmF5KHJvb3RPclZpZXcpID8gZ2V0Um9vdENvbnRleHQocm9vdE9yVmlldykgOiByb290T3JWaWV3IGFzIFJvb3RDb250ZXh0O1xuICAgICAgY29uc3QgcGxheWVyQ29udGV4dCA9IGdldFBsYXllckNvbnRleHQoY29udGV4dCkgITtcbiAgICAgIGNvbnN0IHBsYXllcnNTdGFydEluZGV4ID0gcGxheWVyQ29udGV4dFtQbGF5ZXJJbmRleC5Ob25CdWlsZGVyUGxheWVyc1N0YXJ0XTtcbiAgICAgIGZvciAobGV0IGkgPSBQbGF5ZXJJbmRleC5QbGF5ZXJCdWlsZGVyc1N0YXJ0UG9zaXRpb247IGkgPCBwbGF5ZXJzU3RhcnRJbmRleDtcbiAgICAgICAgICAgaSArPSBQbGF5ZXJJbmRleC5QbGF5ZXJBbmRQbGF5ZXJCdWlsZGVyc1R1cGxlU2l6ZSkge1xuICAgICAgICBjb25zdCBidWlsZGVyID0gcGxheWVyQ29udGV4dFtpXSBhcyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsO1xuICAgICAgICBjb25zdCBwbGF5ZXJJbnNlcnRpb25JbmRleCA9IGkgKyBQbGF5ZXJJbmRleC5QbGF5ZXJPZmZzZXRQb3NpdGlvbjtcbiAgICAgICAgY29uc3Qgb2xkUGxheWVyID0gcGxheWVyQ29udGV4dFtwbGF5ZXJJbnNlcnRpb25JbmRleF0gYXMgUGxheWVyIHwgbnVsbDtcbiAgICAgICAgaWYgKGJ1aWxkZXIpIHtcbiAgICAgICAgICBjb25zdCBwbGF5ZXIgPSBidWlsZGVyLmJ1aWxkUGxheWVyKG9sZFBsYXllciwgaXNGaXJzdFJlbmRlcik7XG4gICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAocGxheWVyICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uc3Qgd2FzUXVldWVkID0gYWRkUGxheWVySW50ZXJuYWwoXG4gICAgICAgICAgICAgICAgICBwbGF5ZXJDb250ZXh0LCByb290Q29udGV4dCwgbmF0aXZlIGFzIEhUTUxFbGVtZW50LCBwbGF5ZXIsIHBsYXllckluc2VydGlvbkluZGV4KTtcbiAgICAgICAgICAgICAgd2FzUXVldWVkICYmIHRvdGFsUGxheWVyc1F1ZXVlZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9sZFBsYXllcikge1xuICAgICAgICAgICAgICBvbGRQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvbGRQbGF5ZXIpIHtcbiAgICAgICAgICAvLyB0aGUgcGxheWVyIGJ1aWxkZXIgaGFzIGJlZW4gcmVtb3ZlZCAuLi4gdGhlcmVmb3JlIHdlIHNob3VsZCBkZWxldGUgdGhlIGFzc29jaWF0ZWRcbiAgICAgICAgICAvLyBwbGF5ZXJcbiAgICAgICAgICBvbGRQbGF5ZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZXRDb250ZXh0UGxheWVyc0RpcnR5KGNvbnRleHQsIGZhbHNlKTtcbiAgICB9XG4gICAgc2V0Q29udGV4dERpcnR5KGNvbnRleHQsIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiB0b3RhbFBsYXllcnNRdWV1ZWQ7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZW5kZXJzIGEgZ2l2ZW4gQ1NTIHByb3AvdmFsdWUgZW50cnkgdXNpbmcgdGhlXG4gKiBwcm92aWRlZCByZW5kZXJlci4gSWYgYSBgc3RvcmVgIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW5cbiAqIHRoYXQgd2lsbCBiZSB1c2VkIGEgcmVuZGVyIGNvbnRleHQgaW5zdGVhZCBvZiB0aGUgcHJvdmlkZWRcbiAqIHJlbmRlcmVyLlxuICpcbiAqIEBwYXJhbSBuYXRpdmUgdGhlIERPTSBFbGVtZW50XG4gKiBAcGFyYW0gcHJvcCB0aGUgQ1NTIHN0eWxlIHByb3BlcnR5IHRoYXQgd2lsbCBiZSByZW5kZXJlZFxuICogQHBhcmFtIHZhbHVlIHRoZSBDU1Mgc3R5bGUgdmFsdWUgdGhhdCB3aWxsIGJlIHJlbmRlcmVkXG4gKiBAcGFyYW0gcmVuZGVyZXJcbiAqIEBwYXJhbSBzdG9yZSBhbiBvcHRpb25hbCBrZXkvdmFsdWUgbWFwIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgY29udGV4dCB0byByZW5kZXIgc3R5bGVzIG9uXG4gKi9cbmZ1bmN0aW9uIHNldFN0eWxlKFxuICAgIG5hdGl2ZTogYW55LCBwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBudWxsLCByZW5kZXJlcjogUmVuZGVyZXIzLFxuICAgIHNhbml0aXplcjogU3R5bGVTYW5pdGl6ZUZuIHwgbnVsbCwgc3RvcmU/OiBCaW5kaW5nU3RvcmUgfCBudWxsLFxuICAgIHBsYXllckJ1aWxkZXI/OiBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fCBudWxsKSB7XG4gIHZhbHVlID0gc2FuaXRpemVyICYmIHZhbHVlID8gc2FuaXRpemVyKHByb3AsIHZhbHVlKSA6IHZhbHVlO1xuICBpZiAoc3RvcmUgfHwgcGxheWVyQnVpbGRlcikge1xuICAgIGlmIChzdG9yZSkge1xuICAgICAgc3RvcmUuc2V0VmFsdWUocHJvcCwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAocGxheWVyQnVpbGRlcikge1xuICAgICAgcGxheWVyQnVpbGRlci5zZXRWYWx1ZShwcm9wLCB2YWx1ZSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlclNldFN0eWxlKys7XG4gICAgaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpID9cbiAgICAgICAgcmVuZGVyZXIuc2V0U3R5bGUobmF0aXZlLCBwcm9wLCB2YWx1ZSwgUmVuZGVyZXJTdHlsZUZsYWdzMy5EYXNoQ2FzZSkgOlxuICAgICAgICBuYXRpdmVbJ3N0eWxlJ10uc2V0UHJvcGVydHkocHJvcCwgdmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJSZW1vdmVTdHlsZSsrO1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/XG4gICAgICAgIHJlbmRlcmVyLnJlbW92ZVN0eWxlKG5hdGl2ZSwgcHJvcCwgUmVuZGVyZXJTdHlsZUZsYWdzMy5EYXNoQ2FzZSkgOlxuICAgICAgICBuYXRpdmVbJ3N0eWxlJ10ucmVtb3ZlUHJvcGVydHkocHJvcCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJlbmRlcnMgYSBnaXZlbiBDU1MgY2xhc3MgdmFsdWUgdXNpbmcgdGhlIHByb3ZpZGVkXG4gKiByZW5kZXJlciAoYnkgYWRkaW5nIG9yIHJlbW92aW5nIGl0IGZyb20gdGhlIHByb3ZpZGVkIGVsZW1lbnQpLlxuICogSWYgYSBgc3RvcmVgIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW4gdGhhdCB3aWxsIGJlIHVzZWQgYSByZW5kZXJcbiAqIGNvbnRleHQgaW5zdGVhZCBvZiB0aGUgcHJvdmlkZWQgcmVuZGVyZXIuXG4gKlxuICogQHBhcmFtIG5hdGl2ZSB0aGUgRE9NIEVsZW1lbnRcbiAqIEBwYXJhbSBwcm9wIHRoZSBDU1Mgc3R5bGUgcHJvcGVydHkgdGhhdCB3aWxsIGJlIHJlbmRlcmVkXG4gKiBAcGFyYW0gdmFsdWUgdGhlIENTUyBzdHlsZSB2YWx1ZSB0aGF0IHdpbGwgYmUgcmVuZGVyZWRcbiAqIEBwYXJhbSByZW5kZXJlclxuICogQHBhcmFtIHN0b3JlIGFuIG9wdGlvbmFsIGtleS92YWx1ZSBtYXAgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSBjb250ZXh0IHRvIHJlbmRlciBzdHlsZXMgb25cbiAqL1xuZnVuY3Rpb24gc2V0Q2xhc3MoXG4gICAgbmF0aXZlOiBhbnksIGNsYXNzTmFtZTogc3RyaW5nLCBhZGQ6IGJvb2xlYW4sIHJlbmRlcmVyOiBSZW5kZXJlcjMsIHN0b3JlPzogQmluZGluZ1N0b3JlIHwgbnVsbCxcbiAgICBwbGF5ZXJCdWlsZGVyPzogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbCkge1xuICBpZiAoc3RvcmUgfHwgcGxheWVyQnVpbGRlcikge1xuICAgIGlmIChzdG9yZSkge1xuICAgICAgc3RvcmUuc2V0VmFsdWUoY2xhc3NOYW1lLCBhZGQpO1xuICAgIH1cbiAgICBpZiAocGxheWVyQnVpbGRlcikge1xuICAgICAgcGxheWVyQnVpbGRlci5zZXRWYWx1ZShjbGFzc05hbWUsIGFkZCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGFkZCkge1xuICAgIG5nRGV2TW9kZSAmJiBuZ0Rldk1vZGUucmVuZGVyZXJBZGRDbGFzcysrO1xuICAgIGlzUHJvY2VkdXJhbFJlbmRlcmVyKHJlbmRlcmVyKSA/IHJlbmRlcmVyLmFkZENsYXNzKG5hdGl2ZSwgY2xhc3NOYW1lKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF0aXZlWydjbGFzc0xpc3QnXS5hZGQoY2xhc3NOYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBuZ0Rldk1vZGUgJiYgbmdEZXZNb2RlLnJlbmRlcmVyUmVtb3ZlQ2xhc3MrKztcbiAgICBpc1Byb2NlZHVyYWxSZW5kZXJlcihyZW5kZXJlcikgPyByZW5kZXJlci5yZW1vdmVDbGFzcyhuYXRpdmUsIGNsYXNzTmFtZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdGl2ZVsnY2xhc3NMaXN0J10ucmVtb3ZlKGNsYXNzTmFtZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0RGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIGlzRGlydHlZZXM6IGJvb2xlYW4pIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9XG4gICAgICBpbmRleCA+PSBTdHlsaW5nSW5kZXguU2luZ2xlU3R5bGVzU3RhcnRQb3NpdGlvbiA/IChpbmRleCArIFN0eWxpbmdJbmRleC5GbGFnc09mZnNldCkgOiBpbmRleDtcbiAgaWYgKGlzRGlydHlZZXMpIHtcbiAgICAoY29udGV4dFthZGp1c3RlZEluZGV4XSBhcyBudW1iZXIpIHw9IFN0eWxpbmdGbGFncy5EaXJ0eTtcbiAgfSBlbHNlIHtcbiAgICAoY29udGV4dFthZGp1c3RlZEluZGV4XSBhcyBudW1iZXIpICY9IH5TdHlsaW5nRmxhZ3MuRGlydHk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNEaXJ0eShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCBhZGp1c3RlZEluZGV4ID1cbiAgICAgIGluZGV4ID49IFN0eWxpbmdJbmRleC5TaW5nbGVTdHlsZXNTdGFydFBvc2l0aW9uID8gKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KSA6IGluZGV4O1xuICByZXR1cm4gKChjb250ZXh0W2FkanVzdGVkSW5kZXhdIGFzIG51bWJlcikgJiBTdHlsaW5nRmxhZ3MuRGlydHkpID09IFN0eWxpbmdGbGFncy5EaXJ0eTtcbn1cblxuZnVuY3Rpb24gaXNDbGFzc0Jhc2VkKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPj0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPyAoaW5kZXggKyBTdHlsaW5nSW5kZXguRmxhZ3NPZmZzZXQpIDogaW5kZXg7XG4gIHJldHVybiAoKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSAmIFN0eWxpbmdGbGFncy5DbGFzcykgPT0gU3R5bGluZ0ZsYWdzLkNsYXNzO1xufVxuXG5mdW5jdGlvbiBpc1Nhbml0aXphYmxlKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFkanVzdGVkSW5kZXggPVxuICAgICAgaW5kZXggPj0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPyAoaW5kZXggKyBTdHlsaW5nSW5kZXguRmxhZ3NPZmZzZXQpIDogaW5kZXg7XG4gIHJldHVybiAoKGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyKSAmIFN0eWxpbmdGbGFncy5TYW5pdGl6ZSkgPT0gU3R5bGluZ0ZsYWdzLlNhbml0aXplO1xufVxuXG5mdW5jdGlvbiBwb2ludGVycyhjb25maWdGbGFnOiBudW1iZXIsIHN0YXRpY0luZGV4OiBudW1iZXIsIGR5bmFtaWNJbmRleDogbnVtYmVyKSB7XG4gIHJldHVybiAoY29uZmlnRmxhZyAmIFN0eWxpbmdGbGFncy5CaXRNYXNrKSB8IChzdGF0aWNJbmRleCA8PCBTdHlsaW5nRmxhZ3MuQml0Q291bnRTaXplKSB8XG4gICAgICAoZHluYW1pY0luZGV4IDw8IChTdHlsaW5nSW5kZXguQml0Q291bnRTaXplICsgU3R5bGluZ0ZsYWdzLkJpdENvdW50U2l6ZSkpO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsVmFsdWUoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGZsYWc6IG51bWJlcik6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgaW5kZXggPSBnZXRJbml0aWFsSW5kZXgoZmxhZyk7XG4gIHJldHVybiBjb250ZXh0W1N0eWxpbmdJbmRleC5Jbml0aWFsU3R5bGVzUG9zaXRpb25dW2luZGV4XSBhcyBudWxsIHwgc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsSW5kZXgoZmxhZzogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChmbGFnID4+IFN0eWxpbmdGbGFncy5CaXRDb3VudFNpemUpICYgU3R5bGluZ0luZGV4LkJpdE1hc2s7XG59XG5cbmZ1bmN0aW9uIGdldE11bHRpT3JTaW5nbGVJbmRleChmbGFnOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBpbmRleCA9XG4gICAgICAoZmxhZyA+PiAoU3R5bGluZ0luZGV4LkJpdENvdW50U2l6ZSArIFN0eWxpbmdGbGFncy5CaXRDb3VudFNpemUpKSAmIFN0eWxpbmdJbmRleC5CaXRNYXNrO1xuICByZXR1cm4gaW5kZXggPj0gU3R5bGluZ0luZGV4LlNpbmdsZVN0eWxlc1N0YXJ0UG9zaXRpb24gPyBpbmRleCA6IC0xO1xufVxuXG5mdW5jdGlvbiBnZXRNdWx0aVN0YXJ0SW5kZXgoY29udGV4dDogU3R5bGluZ0NvbnRleHQpOiBudW1iZXIge1xuICByZXR1cm4gZ2V0TXVsdGlPclNpbmdsZUluZGV4KGNvbnRleHRbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl0pIGFzIG51bWJlcjtcbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGVTYW5pdGl6ZXIoY29udGV4dDogU3R5bGluZ0NvbnRleHQpOiBTdHlsZVNhbml0aXplRm58bnVsbCB7XG4gIHJldHVybiBjb250ZXh0W1N0eWxpbmdJbmRleC5TdHlsZVNhbml0aXplclBvc2l0aW9uXTtcbn1cblxuZnVuY3Rpb24gc2V0UHJvcChjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgcHJvcDogc3RyaW5nKSB7XG4gIGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUHJvcGVydHlPZmZzZXRdID0gcHJvcDtcbn1cblxuZnVuY3Rpb24gc2V0VmFsdWUoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgYm9vbGVhbikge1xuICBjb250ZXh0W2luZGV4ICsgU3R5bGluZ0luZGV4LlZhbHVlT2Zmc2V0XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBoYXNQbGF5ZXJCdWlsZGVyQ2hhbmdlZChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgYnVpbGRlcjogQ2xhc3NBbmRTdHlsZVBsYXllckJ1aWxkZXI8YW55PnwgbnVsbCwgaW5kZXg6IG51bWJlcikge1xuICBjb25zdCBwbGF5ZXJDb250ZXh0ID0gY29udGV4dFtTdHlsaW5nSW5kZXguUGxheWVyQ29udGV4dF0gITtcbiAgaWYgKGJ1aWxkZXIpIHtcbiAgICBpZiAoIXBsYXllckNvbnRleHQgfHwgaW5kZXggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIGlmICghcGxheWVyQ29udGV4dCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcGxheWVyQ29udGV4dFtpbmRleF0gIT09IGJ1aWxkZXI7XG59XG5cbmZ1bmN0aW9uIHNldFBsYXllckJ1aWxkZXIoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGJ1aWxkZXI6IENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyPGFueT58IG51bGwsXG4gICAgaW5zZXJ0aW9uSW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBwbGF5ZXJDb250ZXh0ID0gY29udGV4dFtTdHlsaW5nSW5kZXguUGxheWVyQ29udGV4dF0gfHwgYWxsb2NQbGF5ZXJDb250ZXh0KGNvbnRleHQpO1xuICBpZiAoaW5zZXJ0aW9uSW5kZXggPiAwKSB7XG4gICAgcGxheWVyQ29udGV4dFtpbnNlcnRpb25JbmRleF0gPSBidWlsZGVyO1xuICB9IGVsc2Uge1xuICAgIGluc2VydGlvbkluZGV4ID0gcGxheWVyQ29udGV4dFtQbGF5ZXJJbmRleC5Ob25CdWlsZGVyUGxheWVyc1N0YXJ0XTtcbiAgICBwbGF5ZXJDb250ZXh0LnNwbGljZShpbnNlcnRpb25JbmRleCwgMCwgYnVpbGRlciwgbnVsbCk7XG4gICAgcGxheWVyQ29udGV4dFtQbGF5ZXJJbmRleC5Ob25CdWlsZGVyUGxheWVyc1N0YXJ0XSArPVxuICAgICAgICBQbGF5ZXJJbmRleC5QbGF5ZXJBbmRQbGF5ZXJCdWlsZGVyc1R1cGxlU2l6ZTtcbiAgfVxuICByZXR1cm4gaW5zZXJ0aW9uSW5kZXg7XG59XG5cbmZ1bmN0aW9uIHNldFBsYXllckJ1aWxkZXJJbmRleChjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlciwgcGxheWVyQnVpbGRlckluZGV4OiBudW1iZXIpIHtcbiAgY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5QbGF5ZXJCdWlsZGVySW5kZXhPZmZzZXRdID0gcGxheWVyQnVpbGRlckluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKGNvbnRleHRbaW5kZXggKyBTdHlsaW5nSW5kZXguUGxheWVyQnVpbGRlckluZGV4T2Zmc2V0XSBhcyBudW1iZXIpIHx8IDA7XG59XG5cbmZ1bmN0aW9uIGdldFBsYXllckJ1aWxkZXIoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxhbnk+fFxuICAgIG51bGwge1xuICBjb25zdCBwbGF5ZXJCdWlsZGVySW5kZXggPSBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgaW5kZXgpO1xuICBpZiAocGxheWVyQnVpbGRlckluZGV4KSB7XG4gICAgY29uc3QgcGxheWVyQ29udGV4dCA9IGNvbnRleHRbU3R5bGluZ0luZGV4LlBsYXllckNvbnRleHRdO1xuICAgIGlmIChwbGF5ZXJDb250ZXh0KSB7XG4gICAgICByZXR1cm4gcGxheWVyQ29udGV4dFtwbGF5ZXJCdWlsZGVySW5kZXhdIGFzIENsYXNzQW5kU3R5bGVQbGF5ZXJCdWlsZGVyPGFueT58IG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBzZXRGbGFnKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyLCBmbGFnOiBudW1iZXIpIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9XG4gICAgICBpbmRleCA9PT0gU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbiA/IGluZGV4IDogKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KTtcbiAgY29udGV4dFthZGp1c3RlZEluZGV4XSA9IGZsYWc7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJzKGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgYWRqdXN0ZWRJbmRleCA9XG4gICAgICBpbmRleCA9PT0gU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbiA/IGluZGV4IDogKGluZGV4ICsgU3R5bGluZ0luZGV4LkZsYWdzT2Zmc2V0KTtcbiAgcmV0dXJuIGNvbnRleHRbYWRqdXN0ZWRJbmRleF0gYXMgbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZShjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXg6IG51bWJlcik6IHN0cmluZ3xib29sZWFufG51bGwge1xuICByZXR1cm4gY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5WYWx1ZU9mZnNldF0gYXMgc3RyaW5nIHwgYm9vbGVhbiB8IG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldFByb3AoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gY29udGV4dFtpbmRleCArIFN0eWxpbmdJbmRleC5Qcm9wZXJ0eU9mZnNldF0gYXMgc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250ZXh0RGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzRGlydHkoY29udGV4dCwgU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW1pdFRvU2luZ2xlQ2xhc3Nlcyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCkge1xuICByZXR1cm4gY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSAmIFN0eWxpbmdGbGFncy5Pbmx5UHJvY2Vzc1NpbmdsZUNsYXNzZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0RGlydHkoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGlzRGlydHlZZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgc2V0RGlydHkoY29udGV4dCwgU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbiwgaXNEaXJ0eVllcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0UGxheWVyc0RpcnR5KGNvbnRleHQ6IFN0eWxpbmdDb250ZXh0LCBpc0RpcnR5WWVzOiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChpc0RpcnR5WWVzKSB7XG4gICAgKGNvbnRleHRbU3R5bGluZ0luZGV4Lk1hc3RlckZsYWdQb3NpdGlvbl0gYXMgbnVtYmVyKSB8PSBTdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eTtcbiAgfSBlbHNlIHtcbiAgICAoY29udGV4dFtTdHlsaW5nSW5kZXguTWFzdGVyRmxhZ1Bvc2l0aW9uXSBhcyBudW1iZXIpICY9IH5TdHlsaW5nRmxhZ3MuUGxheWVyQnVpbGRlcnNEaXJ0eTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kRW50cnlQb3NpdGlvbkJ5UHJvcChcbiAgICBjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgcHJvcDogc3RyaW5nLCBzdGFydEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcbiAgZm9yIChsZXQgaSA9IChzdGFydEluZGV4IHx8IDApICsgU3R5bGluZ0luZGV4LlByb3BlcnR5T2Zmc2V0OyBpIDwgY29udGV4dC5sZW5ndGg7XG4gICAgICAgaSArPSBTdHlsaW5nSW5kZXguU2l6ZSkge1xuICAgIGNvbnN0IHRoaXNQcm9wID0gY29udGV4dFtpXTtcbiAgICBpZiAodGhpc1Byb3AgPT0gcHJvcCkge1xuICAgICAgcmV0dXJuIGkgLSBTdHlsaW5nSW5kZXguUHJvcGVydHlPZmZzZXQ7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gc3dhcE11bHRpQ29udGV4dEVudHJpZXMoY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4QTogbnVtYmVyLCBpbmRleEI6IG51bWJlcikge1xuICBjb25zdCB0bXBWYWx1ZSA9IGdldFZhbHVlKGNvbnRleHQsIGluZGV4QSk7XG4gIGNvbnN0IHRtcFByb3AgPSBnZXRQcm9wKGNvbnRleHQsIGluZGV4QSk7XG4gIGNvbnN0IHRtcEZsYWcgPSBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEEpO1xuICBjb25zdCB0bXBQbGF5ZXJCdWlsZGVySW5kZXggPSBnZXRQbGF5ZXJCdWlsZGVySW5kZXgoY29udGV4dCwgaW5kZXhBKTtcblxuICBsZXQgZmxhZ0EgPSB0bXBGbGFnO1xuICBsZXQgZmxhZ0IgPSBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEIpO1xuXG4gIGNvbnN0IHNpbmdsZUluZGV4QSA9IGdldE11bHRpT3JTaW5nbGVJbmRleChmbGFnQSk7XG4gIGlmIChzaW5nbGVJbmRleEEgPj0gMCkge1xuICAgIGNvbnN0IF9mbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXhBKTtcbiAgICBjb25zdCBfaW5pdGlhbCA9IGdldEluaXRpYWxJbmRleChfZmxhZyk7XG4gICAgc2V0RmxhZyhjb250ZXh0LCBzaW5nbGVJbmRleEEsIHBvaW50ZXJzKF9mbGFnLCBfaW5pdGlhbCwgaW5kZXhCKSk7XG4gIH1cblxuICBjb25zdCBzaW5nbGVJbmRleEIgPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgoZmxhZ0IpO1xuICBpZiAoc2luZ2xlSW5kZXhCID49IDApIHtcbiAgICBjb25zdCBfZmxhZyA9IGdldFBvaW50ZXJzKGNvbnRleHQsIHNpbmdsZUluZGV4Qik7XG4gICAgY29uc3QgX2luaXRpYWwgPSBnZXRJbml0aWFsSW5kZXgoX2ZsYWcpO1xuICAgIHNldEZsYWcoY29udGV4dCwgc2luZ2xlSW5kZXhCLCBwb2ludGVycyhfZmxhZywgX2luaXRpYWwsIGluZGV4QSkpO1xuICB9XG5cbiAgc2V0VmFsdWUoY29udGV4dCwgaW5kZXhBLCBnZXRWYWx1ZShjb250ZXh0LCBpbmRleEIpKTtcbiAgc2V0UHJvcChjb250ZXh0LCBpbmRleEEsIGdldFByb3AoY29udGV4dCwgaW5kZXhCKSk7XG4gIHNldEZsYWcoY29udGV4dCwgaW5kZXhBLCBnZXRQb2ludGVycyhjb250ZXh0LCBpbmRleEIpKTtcbiAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4QSwgZ2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4QikpO1xuXG4gIHNldFZhbHVlKGNvbnRleHQsIGluZGV4QiwgdG1wVmFsdWUpO1xuICBzZXRQcm9wKGNvbnRleHQsIGluZGV4QiwgdG1wUHJvcCk7XG4gIHNldEZsYWcoY29udGV4dCwgaW5kZXhCLCB0bXBGbGFnKTtcbiAgc2V0UGxheWVyQnVpbGRlckluZGV4KGNvbnRleHQsIGluZGV4QiwgdG1wUGxheWVyQnVpbGRlckluZGV4KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU2luZ2xlUG9pbnRlclZhbHVlcyhjb250ZXh0OiBTdHlsaW5nQ29udGV4dCwgaW5kZXhTdGFydFBvc2l0aW9uOiBudW1iZXIpIHtcbiAgZm9yIChsZXQgaSA9IGluZGV4U3RhcnRQb3NpdGlvbjsgaSA8IGNvbnRleHQubGVuZ3RoOyBpICs9IFN0eWxpbmdJbmRleC5TaXplKSB7XG4gICAgY29uc3QgbXVsdGlGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgaSk7XG4gICAgY29uc3Qgc2luZ2xlSW5kZXggPSBnZXRNdWx0aU9yU2luZ2xlSW5kZXgobXVsdGlGbGFnKTtcbiAgICBpZiAoc2luZ2xlSW5kZXggPiAwKSB7XG4gICAgICBjb25zdCBzaW5nbGVGbGFnID0gZ2V0UG9pbnRlcnMoY29udGV4dCwgc2luZ2xlSW5kZXgpO1xuICAgICAgY29uc3QgaW5pdGlhbEluZGV4Rm9yU2luZ2xlID0gZ2V0SW5pdGlhbEluZGV4KHNpbmdsZUZsYWcpO1xuICAgICAgY29uc3QgZmxhZ1ZhbHVlID0gKGlzRGlydHkoY29udGV4dCwgc2luZ2xlSW5kZXgpID8gU3R5bGluZ0ZsYWdzLkRpcnR5IDogU3R5bGluZ0ZsYWdzLk5vbmUpIHxcbiAgICAgICAgICAoaXNDbGFzc0Jhc2VkKGNvbnRleHQsIHNpbmdsZUluZGV4KSA/IFN0eWxpbmdGbGFncy5DbGFzcyA6IFN0eWxpbmdGbGFncy5Ob25lKSB8XG4gICAgICAgICAgKGlzU2FuaXRpemFibGUoY29udGV4dCwgc2luZ2xlSW5kZXgpID8gU3R5bGluZ0ZsYWdzLlNhbml0aXplIDogU3R5bGluZ0ZsYWdzLk5vbmUpO1xuICAgICAgY29uc3QgdXBkYXRlZEZsYWcgPSBwb2ludGVycyhmbGFnVmFsdWUsIGluaXRpYWxJbmRleEZvclNpbmdsZSwgaSk7XG4gICAgICBzZXRGbGFnKGNvbnRleHQsIHNpbmdsZUluZGV4LCB1cGRhdGVkRmxhZyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluc2VydE5ld011bHRpUHJvcGVydHkoXG4gICAgY29udGV4dDogU3R5bGluZ0NvbnRleHQsIGluZGV4OiBudW1iZXIsIGNsYXNzQmFzZWQ6IGJvb2xlYW4sIG5hbWU6IHN0cmluZywgZmxhZzogbnVtYmVyLFxuICAgIHZhbHVlOiBzdHJpbmcgfCBib29sZWFuLCBwbGF5ZXJJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGRvU2hpZnQgPSBpbmRleCA8IGNvbnRleHQubGVuZ3RoO1xuXG4gIC8vIHByb3AgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QsIGFkZCBpdCBpblxuICBjb250ZXh0LnNwbGljZShcbiAgICAgIGluZGV4LCAwLCBmbGFnIHwgU3R5bGluZ0ZsYWdzLkRpcnR5IHwgKGNsYXNzQmFzZWQgPyBTdHlsaW5nRmxhZ3MuQ2xhc3MgOiBTdHlsaW5nRmxhZ3MuTm9uZSksXG4gICAgICBuYW1lLCB2YWx1ZSwgcGxheWVySW5kZXgpO1xuXG4gIGlmIChkb1NoaWZ0KSB7XG4gICAgLy8gYmVjYXVzZSB0aGUgdmFsdWUgd2FzIGluc2VydGVkIG1pZHdheSBpbnRvIHRoZSBhcnJheSB0aGVuIHdlXG4gICAgLy8gbmVlZCB0byB1cGRhdGUgYWxsIHRoZSBzaGlmdGVkIG11bHRpIHZhbHVlcycgc2luZ2xlIHZhbHVlXG4gICAgLy8gcG9pbnRlcnMgdG8gcG9pbnQgdG8gdGhlIG5ld2x5IHNoaWZ0ZWQgbG9jYXRpb25cbiAgICB1cGRhdGVTaW5nbGVQb2ludGVyVmFsdWVzKGNvbnRleHQsIGluZGV4ICsgU3R5bGluZ0luZGV4LlNpemUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbHVlRXhpc3RzKHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgYm9vbGVhbiwgaXNDbGFzc0Jhc2VkPzogYm9vbGVhbikge1xuICBpZiAoaXNDbGFzc0Jhc2VkKSB7XG4gICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICB9XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUluaXRpYWxGbGFnKFxuICAgIG5hbWU6IHN0cmluZywgaXNDbGFzc0Jhc2VkOiBib29sZWFuLCBzYW5pdGl6ZXI/OiBTdHlsZVNhbml0aXplRm4gfCBudWxsKSB7XG4gIGlmIChpc0NsYXNzQmFzZWQpIHtcbiAgICByZXR1cm4gU3R5bGluZ0ZsYWdzLkNsYXNzO1xuICB9IGVsc2UgaWYgKHNhbml0aXplciAmJiBzYW5pdGl6ZXIobmFtZSkpIHtcbiAgICByZXR1cm4gU3R5bGluZ0ZsYWdzLlNhbml0aXplO1xuICB9XG4gIHJldHVybiBTdHlsaW5nRmxhZ3MuTm9uZTtcbn1cblxuZnVuY3Rpb24gaGFzVmFsdWVDaGFuZ2VkKFxuICAgIGZsYWc6IG51bWJlciwgYTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bGwsIGI6IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlzQ2xhc3NCYXNlZCA9IGZsYWcgJiBTdHlsaW5nRmxhZ3MuQ2xhc3M7XG4gIGNvbnN0IGhhc1ZhbHVlcyA9IGEgJiYgYjtcbiAgY29uc3QgdXNlc1Nhbml0aXplciA9IGZsYWcgJiBTdHlsaW5nRmxhZ3MuU2FuaXRpemU7XG4gIC8vIHRoZSB0b1N0cmluZygpIGNvbXBhcmlzb24gZW5zdXJlcyB0aGF0IGEgdmFsdWUgaXMgY2hlY2tlZFxuICAvLyAuLi4gb3RoZXJ3aXNlIChkdXJpbmcgc2FuaXRpemF0aW9uIGJ5cGFzc2luZykgdGhlID09PSBjb21wYXJzaW9uXG4gIC8vIHdvdWxkIGZhaWwgc2luY2UgYSBuZXcgU3RyaW5nKCkgaW5zdGFuY2UgaXMgY3JlYXRlZFxuICBpZiAoIWlzQ2xhc3NCYXNlZCAmJiBoYXNWYWx1ZXMgJiYgdXNlc1Nhbml0aXplcikge1xuICAgIC8vIHdlIGtub3cgZm9yIHN1cmUgd2UncmUgZGVhbGluZyB3aXRoIHN0cmluZ3MgYXQgdGhpcyBwb2ludFxuICAgIHJldHVybiAoYSBhcyBzdHJpbmcpLnRvU3RyaW5nKCkgIT09IChiIGFzIHN0cmluZykudG9TdHJpbmcoKTtcbiAgfVxuXG4gIC8vIGV2ZXJ5dGhpbmcgZWxzZSBpcyBzYWZlIHRvIGNoZWNrIHdpdGggYSBub3JtYWwgZXF1YWxpdHkgY2hlY2tcbiAgcmV0dXJuIGEgIT09IGI7XG59XG5cbmV4cG9ydCBjbGFzcyBDbGFzc0FuZFN0eWxlUGxheWVyQnVpbGRlcjxUPiBpbXBsZW1lbnRzIFBsYXllckJ1aWxkZXIge1xuICBwcml2YXRlIF92YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudWxsfSA9IHt9O1xuICBwcml2YXRlIF9kaXJ0eSA9IGZhbHNlO1xuICBwcml2YXRlIF9mYWN0b3J5OiBCb3VuZFBsYXllckZhY3Rvcnk8VD47XG5cbiAgY29uc3RydWN0b3IoZmFjdG9yeTogUGxheWVyRmFjdG9yeSwgcHJpdmF0ZSBfZWxlbWVudDogSFRNTEVsZW1lbnQsIHByaXZhdGUgX3R5cGU6IEJpbmRpbmdUeXBlKSB7XG4gICAgdGhpcy5fZmFjdG9yeSA9IGZhY3RvcnkgYXMgYW55O1xuICB9XG5cbiAgc2V0VmFsdWUocHJvcDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuX3ZhbHVlc1twcm9wXSAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuX3ZhbHVlc1twcm9wXSA9IHZhbHVlO1xuICAgICAgdGhpcy5fZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkUGxheWVyKGN1cnJlbnRQbGF5ZXI6IFBsYXllcnxudWxsLCBpc0ZpcnN0UmVuZGVyOiBib29sZWFuKTogUGxheWVyfHVuZGVmaW5lZHxudWxsIHtcbiAgICAvLyBpZiBubyB2YWx1ZXMgaGF2ZSBiZWVuIHNldCBoZXJlIHRoZW4gdGhpcyBtZWFucyB0aGUgYmluZGluZyBkaWRuJ3RcbiAgICAvLyBjaGFuZ2UgYW5kIHRoZXJlZm9yZSB0aGUgYmluZGluZyB2YWx1ZXMgd2VyZSBub3QgdXBkYXRlZCB0aHJvdWdoXG4gICAgLy8gYHNldFZhbHVlYCB3aGljaCBtZWFucyBubyBuZXcgcGxheWVyIHdpbGwgYmUgcHJvdmlkZWQuXG4gICAgaWYgKHRoaXMuX2RpcnR5KSB7XG4gICAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLl9mYWN0b3J5LmZuKFxuICAgICAgICAgIHRoaXMuX2VsZW1lbnQsIHRoaXMuX3R5cGUsIHRoaXMuX3ZhbHVlcyAhLCBpc0ZpcnN0UmVuZGVyLCBjdXJyZW50UGxheWVyIHx8IG51bGwpO1xuICAgICAgdGhpcy5fdmFsdWVzID0ge307XG4gICAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHBsYXllcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=