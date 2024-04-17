import { useEffect, useState } from "react";

import "./index.css";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAlert } from "../../../context/AlertContext";
import { getTagsWithQuestionNumber } from "../../../services/tagService";

const NewQuestion = ({ addQuestion }) => {
  const alert = useAlert();
  const [tagsList, setTagsList] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      let res = await getTagsWithQuestionNumber();
      res = res.map((tag) => tag.name);
      setTagsList(res || []);
    };
    fetchTags().catch((e) => console.log(e));
  }, []);

  const postQuestion = () => {
    if (title.length === 0) {
      alert.showAlert("Question Title cannot be empty", "error");
      return;
    }

    if (description.length === 0) {
      alert.showAlert("Question Description cannot be empty", "error");
      return;
    }

    if (tags.length === 0) {
      alert.showAlert("Please add atleast one tag", "error");
      return;
    }

    if (title.length > 100) {
      alert.showAlert(
        "Question Title should be less than 100 characters",
        "error"
      );
      return;
    }

    if (description.length > 500) {
      alert.showAlert(
        "Question Description should be less than 500 characters",
        "error"
      );
      return;
    }

    if (tags.length > 5) {
      alert.showAlert("Question Tags should be less than 5", "error");
      return;
    }

    let question = {
      title: title,
      description: description,
      tags: tags,
    };

    addQuestion(question);
  };

  const handleTagsChange = (event, value) => {
    setTags(value);
  };

  const handleTagsRenderInput = (params) => (
    <TextField {...params} label="Tags" placeholder="Tags" />
  );

  const handleRenderTags = (value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        key={index}
        color="primary"
        variant="outlined"
        label={option}
        {...getTagProps({ index })}
      />
    ));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        "& > :not(style)": {
          m: 1,
          mt: 5,
        },
      }}
    >
      <Paper
        sx={{
          width: "50%",
          borderRadius: "10px",
          paddingLeft: 5,
          paddingRight: 5,
          paddingTop: 1,
          paddingBottom: 3,
          height: "fit-content",
        }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", mb: 2, mt: 2 }}>
          Add New Question
        </Typography>
        <div className="flex-spaced">
          <TextField
            id="title"
            label="Question Title"
            variant="outlined"
            placeholder="Limit title to 100 characters or less"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ width: "100%" }}
            required
          />
          <TextField
            id="description"
            label="Question Description"
            variant="outlined"
            placeholder="Add a good question description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ width: "100%" }}
            multiline
            rows={3}
            required
          />
          <Autocomplete
            multiple
            freeSolo
            required
            limitTags={5}
            onChange={handleTagsChange}
            filterSelectedOptions
            id="tags"
            options={tagsList}
            getOptionLabel={(option) => option}
            renderTags={handleRenderTags}
            renderInput={handleTagsRenderInput}
            sx={{ width: "500px" }}
          />
        </div>
        <div className="btn_indicator_container">
          <Button
            variant="contained"
            onClick={() => {
              postQuestion();
            }}
          >
            Post Question
          </Button>
          <div className="mandatory_indicator">
            * indicates mandatory fields
          </div>
        </div>
      </Paper>
    </Box>
  );
};

export default NewQuestion;
