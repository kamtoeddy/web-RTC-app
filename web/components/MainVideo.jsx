import { useContext } from "react";

// mui components
import { List, ListItem, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";

// mui icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CloseIcon from "@mui/icons-material/Close";

// constexts
import { AuthContext } from "../contexts/AuthContext";
import { BroadcastContext } from "../contexts/BroadcastContext";

// hooks
import useFetch from "../hooks/useFetch";

// styles
import styles from "./broadcast/video.module.scss";

const useStyles = makeStyles(() => ({
  bcastListItem: {
    maxWidth: "300px",
    borderRadius: 8,
    boxShadow: "1px 2px 8px 5px #eee",
    cursor: "pointer",
    "&:hover": { transform: "scale(1.02)" },
  },
  activeReview: { color: "blue" },
  reviewValue: { color: "black" },
}));

const MainVideo = (props) => {
  const { user } = useContext(AuthContext);
  const {
    bcastVideo,
    dislikes,
    likes,
    isWatching,
    startWatching,
    views,
    watchingNow,
  } = useContext(BroadcastContext);

  const classes = useStyles();
  const theme = useTheme();

  const iLiked = likes.indexOf(user._id) != -1;
  const iDisLiked = dislikes.indexOf(user._id) != -1;

  const url = `${
    process.env.NEXT_PUBLIC_BACKEND + "broadcasts/getActiveBcasts"
  }`;

  let bcastItems;

  let { data, loading, error } = useFetch(url, !isWatching);

  if (data) {
    bcastItems = data.map((bcast) => (
      <ListItem
        className={classes.bcastListItem}
        key={bcast.id}
        onClick={() => startWatching(bcast.id)}
      >
        <Typography variant="h6">{bcast.hostName}</Typography>
      </ListItem>
    ));
  }

  return (
    <>
      {error && <div>{error}</div>}

      {loading && (
        <Grid container style={{ margin: `${theme.spacing(1)} auto` }}>
          {new Array(21).fill(1).map((item, index) => {
            return (
              <Grid item style={{ padding: theme.spacing(1) }} key={index}>
                <Stack spacing={0.2}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" width={300} height={50} />
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      )}

      {!isWatching && bcastItems && (
        <Grid container>
          <Grid item xs={12}>
            <List>{bcastItems}</List>
          </Grid>
        </Grid>
      )}

      {isWatching && (
        <>
          <video ref={bcastVideo} className={styles.mainVideo} />

          <div className={styles.videoFeedIcons}>
            <Button startIcon={<VisibilityIcon />}>
              {views > 0 ? views : ""}
            </Button>
            <Button startIcon={<TrackChangesIcon />}>
              {watchingNow > 0 ? watchingNow : ""}
            </Button>
            <Button
              startIcon={<ThumbUpIcon />}
              className={iLiked ? classes.activeReview : ""}
              onClick={props.likeVideo}
            >
              {likes.length > 0 ? likes.length : ""}
            </Button>
            <Button
              startIcon={<ThumbDownAltIcon />}
              className={iDisLiked ? classes.activeReview : ""}
              onClick={props.dislikeVideo}
            >
              {dislikes.length > 0 ? dislikes.length : ""}
            </Button>
            <Button
              startIcon={<CloseIcon />}
              onClick={props.stopWatching}
            ></Button>
          </div>
        </>
      )}
    </>
  );
};

export default MainVideo;
