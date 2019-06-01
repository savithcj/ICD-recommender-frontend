import React from "react";
import Autosuggest from "react-autosuggest";
import Autowhatever from "react-autowhatever";
import { mapToAutowhateverTheme } from "./theme";

const alwaysTrue = () => true;

/**
 * Extending react-autosuggest, override the render() to allow navigating
 * the dropdown suggestion list using keyboard
 */
class AutoSuggest extends Autosuggest {
  render() {
    const {
      suggestions,
      renderInputComponent,
      onSuggestionsFetchRequested,
      renderSuggestion,
      inputProps,
      multiSection,
      renderSectionTitle,
      id,
      getSectionSuggestions,
      theme,
      getSuggestionValue,
      alwaysRenderSuggestions,
      highlightFirstSuggestion
    } = this.props;
    const {
      isFocused,
      isCollapsed,
      highlightedSectionIndex,
      highlightedSuggestionIndex,
      valueBeforeUpDown
    } = this.state;
    const shouldRenderSuggestions = alwaysRenderSuggestions ? alwaysTrue : this.props.shouldRenderSuggestions;
    const { value, onFocus, onKeyDown } = inputProps;
    const willRenderSuggestions = this.willRenderSuggestions(this.props);
    const isOpen = alwaysRenderSuggestions || (isFocused && !isCollapsed && willRenderSuggestions);
    const items = isOpen ? suggestions : [];

    const autowhateverInputProps = {
      ...inputProps,
      onFocus: event => {
        if (!this.justSelectedSuggestion && !this.justClickedOnSuggestionsContainer) {
          const shouldRender = shouldRenderSuggestions(value);

          this.setState({
            isFocused: true,
            isCollapsed: !shouldRender
          });

          onFocus && onFocus(event);

          if (shouldRender) {
            onSuggestionsFetchRequested({ value, reason: "input-focused" });
          }
        }
      },
      onBlur: event => {
        if (this.justClickedOnSuggestionsContainer) {
          this.input.focus();
          return;
        }

        this.blurEvent = event;

        if (!this.justSelectedSuggestion) {
          this.onBlur();
          this.onSuggestionsClearRequested();
        }
      },
      onChange: event => {
        const { value } = event.target;
        const shouldRender = shouldRenderSuggestions(value);

        this.maybeCallOnChange(event, value, "type");

        if (this.suggestionsContainer) {
          this.suggestionsContainer.scrollTop = 0;
        }

        this.setState({
          ...(highlightFirstSuggestion
            ? {}
            : {
                highlightedSectionIndex: null,
                highlightedSuggestionIndex: null,
                highlightedSuggestion: null
              }),
          valueBeforeUpDown: null,
          isCollapsed: !shouldRender
        });

        if (shouldRender) {
          onSuggestionsFetchRequested({ value, reason: "input-changed" });
        } else {
          this.onSuggestionsClearRequested();
        }
      },
      onKeyDown: (event, data) => {
        const { keyCode } = event;

        switch (keyCode) {
          case 40: // ArrowDown
          case 38: // ArrowUp
            if (isCollapsed) {
              if (shouldRenderSuggestions(value)) {
                onSuggestionsFetchRequested({
                  value,
                  reason: "suggestions-revealed"
                });
                this.revealSuggestions();
              }
            } else if (suggestions.length > 0) {
              const { newHighlightedSectionIndex, newHighlightedItemIndex } = data;

              let newValue;

              if (newHighlightedItemIndex === null) {
                // valueBeforeUpDown can be null if, for example, user
                // hovers on the first suggestion and then pressed Up.
                // If that happens, use the original input value.
                newValue = valueBeforeUpDown === null ? value : valueBeforeUpDown;
              } else {
                newValue = this.getSuggestionValueByIndex(newHighlightedSectionIndex, newHighlightedItemIndex);
              }

              console.log("newValue=" + newValue + " value=" + value + " valueBeforeUpDown=" + valueBeforeUpDown);

              this.updateHighlightedSuggestion(newHighlightedSectionIndex, newHighlightedItemIndex, value);
              this.maybeCallOnChange(event, newValue, keyCode === 40 ? "down" : "up");
            }

            event.preventDefault(); // Prevents the cursor from moving

            this.justPressedUpDown = true;

            setTimeout(() => {
              this.justPressedUpDown = false;
            });

            break;

          case 37: {
            //left-arrow
            const highlightedSuggestion = this.getHighlightedSuggestion();

            if (highlightedSuggestion !== null) {
              const targetSelection = highlightedSuggestion.code.slice(0, -1);
              console.log(targetSelection);
              inputProps.onChange("", { newValue: targetSelection });
              onSuggestionsFetchRequested({
                value: targetSelection,
                reason: "input-focused"
              });
            }
            break;
          }

          case 9: //tab
            event.preventDefault();
          case 39: {
            //right-arrow
            const highlightedSuggestion = this.getHighlightedSuggestion();

            if (highlightedSuggestion !== null) {
              const targetSelection = highlightedSuggestion.code;
              console.log(targetSelection);
              inputProps.onChange("", { newValue: targetSelection });
              onSuggestionsFetchRequested({
                value: targetSelection,
                reason: "input-focused"
              });
            }
            break;
          }

          // Enter
          case 13: {
            // See #388
            if (event.keyCode === 229) {
              break;
            }

            const highlightedSuggestion = this.getHighlightedSuggestion();

            if (isOpen && !alwaysRenderSuggestions) {
              this.closeSuggestions();
            }

            if (highlightedSuggestion != null) {
              const newValue = getSuggestionValue(highlightedSuggestion);

              this.maybeCallOnChange(event, newValue, "enter");

              this.onSuggestionSelected(event, {
                suggestion: highlightedSuggestion,
                suggestionValue: newValue,
                suggestionIndex: highlightedSuggestionIndex,
                sectionIndex: highlightedSectionIndex,
                method: "enter"
              });

              this.justSelectedSuggestion = true;

              setTimeout(() => {
                this.justSelectedSuggestion = false;
              });
            }

            break;
          }

          // Escape
          case 27: {
            if (isOpen) {
              // If input.type === 'search', the browser clears the input
              // when Escape is pressed. We want to disable this default
              // behaviour so that, when suggestions are shown, we just hide
              // them, without clearing the input.
              event.preventDefault();
            }

            const willCloseSuggestions = isOpen && !alwaysRenderSuggestions;

            if (valueBeforeUpDown === null) {
              // Didn't interact with Up/Down
              if (!willCloseSuggestions) {
                const newValue = "";

                this.maybeCallOnChange(event, newValue, "escape");

                if (shouldRenderSuggestions(newValue)) {
                  onSuggestionsFetchRequested({
                    value: newValue,
                    reason: "escape-pressed"
                  });
                } else {
                  this.onSuggestionsClearRequested();
                }
              }
            } else {
              // Interacted with Up/Down
              this.maybeCallOnChange(event, valueBeforeUpDown, "escape");
            }

            if (willCloseSuggestions) {
              this.onSuggestionsClearRequested();
              this.closeSuggestions();
            } else {
              this.resetHighlightedSuggestion();
            }

            break;
          }
        }

        onKeyDown && onKeyDown(event);
      }
    };
    const renderSuggestionData = {
      query: this.getQuery()
    };

    return (
      <Autowhatever
        multiSection={multiSection}
        items={items}
        renderInputComponent={renderInputComponent}
        renderItemsContainer={this.renderSuggestionsContainer}
        renderItem={renderSuggestion}
        renderItemData={renderSuggestionData}
        renderSectionTitle={renderSectionTitle}
        getSectionItems={getSectionSuggestions}
        highlightedSectionIndex={highlightedSectionIndex}
        highlightedItemIndex={highlightedSuggestionIndex}
        inputProps={autowhateverInputProps}
        itemProps={this.itemProps}
        theme={mapToAutowhateverTheme(theme)}
        id={id}
        ref={this.storeAutowhateverRef}
      />
    );
  }
}

export default AutoSuggest;
