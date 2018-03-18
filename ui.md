# UI Ideas

## Omnibar

### Commands where you can fill things in
- `/` to enter command mode
- `${firstFewLetters}` to get the target command on top
- TAB to switch focus to that command
- System will
  + "temporarily" fill in the command in the query and add a colon (:)
  + set the focus in the first field of the command component
  + From there, TAB will only go to the next match if the first field is empty and there are more matches
  + If text is entered, it is also copied over in the query field, indicating the correct syntax, including for things like spaces and the like
