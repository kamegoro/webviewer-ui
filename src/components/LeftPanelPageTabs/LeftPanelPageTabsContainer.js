import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import selectors from 'selectors';
import actions from 'actions';
import {
  deletePages,
  extractPages,
  noPagesSelectedWarning,
  replace,
  rotateClockwise,
  rotateCounterClockwise,
  movePagesToBottom,
  movePagesToTop
} from 'helpers/pageManipulationFunctions';
import LeftPanelPageTabsSmall from 'src/components/LeftPanelPageTabs/LeftPanelPageTabsSmall/LeftPanelPageTabsSmall';
import LeftPanelPageTabs from 'components/LeftPanelPageTabs/LeftPanelPageTabs/LeftPanelPageTabs';
import { workerTypes } from 'constants/types';
import core from 'src/core';
import LeftPanelPageTabsRotate from 'components/LeftPanelPageTabs/LeftPanelPageTabsRotate/LeftPanelPageTabsRotate';
import LeftPanelPageTabsLarge from './LeftPanelPageTabsLarge/LeftPanelPageTabsLarge';
import DataElements from 'constants/dataElement';

function LeftPanelPageTabsContainer() {
  const dispatch = useDispatch();
  const [selectedPageIndexes, leftPanelWidth, deleteModalEnabled, multiPageManipulationControlsItems, multiPageManipulationControlsSmall, multiPageManipulationControlsLarge] = useSelector((state) => [
    selectors.getSelectedThumbnailPageIndexes(state),
    selectors.getLeftPanelWidth(state),
    selectors.pageDeletionConfirmationModalEnabled(state),
    selectors.getMultiPageManipulationControlsItems(state),
    selectors.getMultiPageManipulationControlsItemsSmall(state),
    selectors.getMultiPageManipulationControlsItemsLarge(state),
  ]);

  const pageNumbers = selectedPageIndexes.map((index) => index + 1);

  const openInsertPageModal = () => {
    dispatch(actions.closeElement(DataElements.PAGE_MANIPULATION_OVERLAY));
    dispatch(actions.openElement('insertPageModal'));
  };

  const onReplace = () => !noPagesSelectedWarning(pageNumbers, dispatch) && replace(dispatch);
  const onExtractPages = () => !noPagesSelectedWarning(pageNumbers, dispatch) && extractPages(pageNumbers, dispatch);
  const onDeletePages = () => !noPagesSelectedWarning(pageNumbers, dispatch) && deletePages(pageNumbers, dispatch, deleteModalEnabled);
  const onRotateClockwise = () => !noPagesSelectedWarning(pageNumbers, dispatch) && rotateClockwise(pageNumbers);
  const onRotateCounterClockwise = () => !noPagesSelectedWarning(pageNumbers, dispatch) && rotateCounterClockwise(pageNumbers);
  const onInsert = () => !noPagesSelectedWarning(pageNumbers, dispatch) && openInsertPageModal();
  const moveToTop = () => !noPagesSelectedWarning(pageNumbers, dispatch) && movePagesToTop(pageNumbers);
  const moveToBottom = () => !noPagesSelectedWarning(pageNumbers, dispatch) && movePagesToBottom(pageNumbers);

  const document = core.getDocument();
  const documentType = document?.type;
  const isXod = documentType === workerTypes.XOD;
  const isOffice = documentType === workerTypes.OFFICE || documentType === workerTypes.LEGACY_OFFICE;

  if (isXod || isOffice || document?.isWebViewerServerDocument()) {
    return (
      <LeftPanelPageTabsRotate onRotateClockwise={onRotateClockwise} onRotateCounterClockwise={onRotateCounterClockwise} />
    );
  }
  // Breakpoint to convert to popups
  const breakPoint = 360;
  const isPanelSmall = leftPanelWidth < breakPoint;
  const isPanelLarge = leftPanelWidth > 600;

  if (isPanelSmall) {
    return <LeftPanelPageTabsSmall
      onReplace={onReplace}
      onExtractPages={onExtractPages}
      onDeletePages={onDeletePages}
      onRotateCounterClockwise={onRotateCounterClockwise}
      onRotateClockwise={onRotateClockwise}
      onInsert={onInsert}
      pageNumbers={pageNumbers}
      multiPageManipulationControlsItemsSmall={multiPageManipulationControlsSmall}
    />;
  }

  if (isPanelLarge) {
    return <LeftPanelPageTabsLarge
      onReplace={onReplace}
      onExtractPages={onExtractPages}
      onDeletePages={onDeletePages}
      onRotateCounterClockwise={onRotateCounterClockwise}
      onRotateClockwise={onRotateClockwise}
      onInsert={onInsert}
      moveToTop={moveToTop}
      moveToBottom={moveToBottom}
      pageNumbers={pageNumbers}
      multiPageManipulationControlsItems={multiPageManipulationControlsLarge}
    />;
  }


  return (
    <LeftPanelPageTabs
      onReplace={onReplace}
      onExtractPages={onExtractPages}
      onDeletePages={onDeletePages}
      onRotateCounterClockwise={onRotateCounterClockwise}
      onRotateClockwise={onRotateClockwise}
      onInsert={onInsert}
      pageNumbers={pageNumbers}
      multiPageManipulationControlsItems={multiPageManipulationControlsItems}
    />
  );
}

export default LeftPanelPageTabsContainer;
